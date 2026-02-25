import type { DoseKind } from './base';
import type { VaccinationValidationErrorCode } from './validation';

export interface VaccinationCompletedImportRow {
  batchNumber: string | null;
  completedAt: string;
  diseaseId: string;
  kind: DoseKind;
  rowNumber: number;
  tradeName: string | null;
}

export type VaccinationCompletedImportRowErrorCode =
  | VaccinationValidationErrorCode
  | 'invalid_columns'
  | 'invalid_completed_at'
  | 'persist_failed'
  | 'unknown_disease'
  | 'unknown_dose_kind';

export interface VaccinationCompletedImportRowError {
  code: VaccinationCompletedImportRowErrorCode;
  messageKey: string;
  messageValues?: Record<string, number | string>;
  rowNumber: number;
}

export type VaccinationCompletedImportFileErrorCode =
  | 'invalid_csv'
  | 'invalid_file'
  | 'target_unavailable'
  | 'unsupported_header';

export interface VaccinationCompletedImportFileError {
  code: VaccinationCompletedImportFileErrorCode;
  messageKey: string;
}

export interface VaccinationCompletedImportParseResult {
  fileError: VaccinationCompletedImportFileError | null;
  rowErrors: VaccinationCompletedImportRowError[];
  rows: VaccinationCompletedImportRow[];
  totalDataRows: number;
}

export interface VaccinationCompletedImportReport {
  duplicateRows: number;
  errors: VaccinationCompletedImportRowError[];
  importedRows: number;
  invalidRows: number;
  totalDataRows: number;
}
