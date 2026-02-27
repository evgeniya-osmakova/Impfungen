import { INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE } from 'src/constants/internalHomeText.ts';
import { VACCINATION_VALIDATION_ERROR_CODE } from 'src/constants/vaccinationValidation.ts';
import type { ImmunizationSeriesInput } from 'src/interfaces/immunizationRecord.ts';
import type {
  VaccinationCompletedImportReport,
  VaccinationCompletedImportRow,
  VaccinationCompletedImportRowError,
} from 'src/interfaces/vaccinationImport.ts';
import type { VaccinationState } from 'src/interfaces/vaccinationState.ts';
import { normalizeOptionalText } from 'src/utils/string.ts';

import { useAccountsStore } from '../accounts';

import { isTrpcConflictError } from './errors.ts';
import { useVaccinationStore } from './index.ts';
import {
  persistCompletedDose,
  persistSubmittedRecord,
} from './persistence.ts';
import {
  resolveNewCompletedDoseId,
  resolveSubmitRecordCompletedDoseId,
  resolveUpdatedRecord,
} from './recordResolution.ts';
import {
  submitCompletedDoseUseCase,
  submitRecordUseCase,
} from './vaccinationRecordUseCases.ts';

const compareRowsForImport = (
  leftRow: VaccinationCompletedImportRow,
  rightRow: VaccinationCompletedImportRow,
): number => {
  const byDisease = leftRow.diseaseId.localeCompare(rightRow.diseaseId);

  if (byDisease !== 0) {
    return byDisease;
  }

  const byCompletedAt = leftRow.completedAt.localeCompare(rightRow.completedAt);

  if (byCompletedAt !== 0) {
    return byCompletedAt;
  }

  const byKind = leftRow.kind.localeCompare(rightRow.kind);

  if (byKind !== 0) {
    return byKind;
  }

  return leftRow.rowNumber - rightRow.rowNumber;
};

const createDuplicateKeyFromImportRow = (row: VaccinationCompletedImportRow): string =>
  [
    row.diseaseId,
    row.completedAt,
    row.kind,
    normalizeOptionalText(row.tradeName) ?? '',
    normalizeOptionalText(row.batchNumber) ?? '',
  ].join('\u0001');

const createDuplicateKeyFromStoredDose = (
  diseaseId: string,
  dose: VaccinationState['records'][number]['completedDoses'][number],
): string =>
  [
    diseaseId,
    dose.completedAt,
    dose.kind,
    normalizeOptionalText(dose.tradeName) ?? '',
    normalizeOptionalText(dose.batchNumber) ?? '',
  ].join('\u0001');

const createInitialDuplicateKeySet = (
  records: readonly VaccinationState['records'][number][],
): Set<string> => {
  const duplicateKeys = new Set<string>();

  for (const record of records) {
    for (const dose of record.completedDoses) {
      duplicateKeys.add(createDuplicateKeyFromStoredDose(record.diseaseId, dose));
    }
  }

  return duplicateKeys;
};

const toRowError = (
  rowNumber: number,
  code: VaccinationCompletedImportRowError['code'],
): VaccinationCompletedImportRowError => {
  if (code in INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE) {
    const messageKey = INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE[
      code as keyof typeof INTERNAL_HOME_FORM_ERROR_TEXT_KEY_BY_CODE
    ];

    return {
      code,
      messageKey,
      rowNumber,
    };
  }

  return {
    code,
    messageKey: 'internal.records.import.report.rowError.persistFailed',
    rowNumber,
  };
};

const createEmptyReport = (totalDataRows: number): VaccinationCompletedImportReport => ({
  duplicateRows: 0,
  errors: [],
  importedRows: 0,
  invalidRows: 0,
  totalDataRows,
});

export const importCompletedVaccinations = async ({
  rows,
}: {
  rows: readonly VaccinationCompletedImportRow[];
}): Promise<VaccinationCompletedImportReport> => {
  const sortedRows = [...rows].sort(compareRowsForImport);
  const initialRecords = useVaccinationStore.getState().records;
  const duplicateKeys = createInitialDuplicateKeySet(initialRecords);
  const report = createEmptyReport(rows.length);

  for (const row of sortedRows) {
    const duplicateKey = createDuplicateKeyFromImportRow(row);

    if (duplicateKeys.has(duplicateKey)) {
      report.duplicateRows += 1;
      continue;
    }

    const { activeAccountId, records } = useVaccinationStore.getState();

    if (activeAccountId === null) {
      report.invalidRows += 1;
      report.errors.push(toRowError(row.rowNumber, 'persist_failed'));
      continue;
    }

    const existingRecord = records.find((record) => record.diseaseId === row.diseaseId);

    if (!existingRecord) {
      const recordInput: ImmunizationSeriesInput = {
        batchNumber: row.batchNumber,
        completedAt: row.completedAt,
        completedDoseKind: row.kind,
        diseaseId: row.diseaseId,
        futureDueDoses: [],
        repeatEvery: null,
        tradeName: row.tradeName,
      };
      const submissionResult = submitRecordUseCase(records, recordInput);

      if (submissionResult.errorCode || !submissionResult.records) {
        report.invalidRows += 1;
        report.errors.push(toRowError(
          row.rowNumber,
          submissionResult.errorCode ?? VACCINATION_VALIDATION_ERROR_CODE.sync_conflict,
        ));
        continue;
      }

      try {
        const nextRecord = resolveUpdatedRecord(row.diseaseId, submissionResult.records);
        const completedDoseId = resolveSubmitRecordCompletedDoseId(undefined, nextRecord);

        if (!completedDoseId) {
          throw new Error(`Unable to resolve imported completed dose id for disease ${row.diseaseId}.`);
        }

        const snapshot = await persistSubmittedRecord({
          accountId: activeAccountId,
          completedDoseId,
          expectedUpdatedAt: null,
          recordInput,
        });

        if (snapshot) {
          useAccountsStore.getState().replaceFromProfileSnapshot(snapshot);
        } else {
          useVaccinationStore.getState().replaceRecords(submissionResult.records);
        }

        duplicateKeys.add(duplicateKey);
        report.importedRows += 1;
      } catch (error) {
        report.invalidRows += 1;
        report.errors.push(toRowError(
          row.rowNumber,
          isTrpcConflictError(error) ? VACCINATION_VALIDATION_ERROR_CODE.sync_conflict : 'persist_failed',
        ));
      }

      continue;
    }

    const doseInput = {
      batchNumber: row.batchNumber,
      completedAt: row.completedAt,
      diseaseId: row.diseaseId,
      kind: row.kind,
      plannedDoseId: null,
      tradeName: row.tradeName,
    };
    const submissionResult = submitCompletedDoseUseCase(records, doseInput);

    if (submissionResult.errorCode || !submissionResult.records) {
      report.invalidRows += 1;
      report.errors.push(toRowError(
        row.rowNumber,
        submissionResult.errorCode ?? VACCINATION_VALIDATION_ERROR_CODE.sync_conflict,
      ));
      continue;
    }

    try {
      const nextRecord = resolveUpdatedRecord(row.diseaseId, submissionResult.records);
      const newDoseId = resolveNewCompletedDoseId(existingRecord, nextRecord);

      if (!newDoseId) {
        throw new Error(`Unable to resolve imported completed dose id for disease ${row.diseaseId}.`);
      }

      const snapshot = await persistCompletedDose({
        accountId: activeAccountId,
        doseId: newDoseId,
        doseInput,
        expectedUpdatedAt: existingRecord.updatedAt,
      });

      if (snapshot) {
        useAccountsStore.getState().replaceFromProfileSnapshot(snapshot);
      } else {
        useVaccinationStore.getState().replaceRecords(submissionResult.records);
      }

      duplicateKeys.add(duplicateKey);
      report.importedRows += 1;
    } catch (error) {
      report.invalidRows += 1;
      report.errors.push(toRowError(
        row.rowNumber,
        isTrpcConflictError(error) ? VACCINATION_VALIDATION_ERROR_CODE.sync_conflict : 'persist_failed',
      ));
    }
  }

  return report;
};
