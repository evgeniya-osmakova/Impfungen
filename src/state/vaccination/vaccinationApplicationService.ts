import type { CountryCode } from '../../interfaces/base';
import type { CompleteDoseDraft } from '../../interfaces/completeDoseDraft';
import type {
  ImmunizationDoseInput,
  ImmunizationSeries,
  ImmunizationSeriesInput,
} from '../../interfaces/immunizationRecord';
import {
  buildAddDoseDraft,
  buildMarkPlannedDoneDraft,
} from './completeDoseDraft';
import {
  confirmCountryUseCase,
  setCountryUseCase,
} from './vaccinationCountryUseCases';
import {
  createVaccinationAppDefaults,
  loadVaccinationAppState,
  saveVaccinationAppState,
} from './vaccinationPersistence';
import {
  removeRecordUseCase,
  startEditRecordUseCase,
  submitCompletedDoseUseCase,
  submitRecordUseCase,
  upsertRecordUseCase,
  type ValidationOutcome,
} from './vaccinationRecordUseCases';

import type { VaccinationAppState } from './vaccinationAppState';
import type {
  VaccinationClock,
  VaccinationIdGenerator,
} from './vaccinationDependencies';
import type { VaccinationRepository } from './vaccinationRepository';

interface MarkPlannedDonePayload {
  diseaseId: string;
  dueAt: string;
  kind: ImmunizationDoseInput['kind'];
  plannedDoseId: string | null;
}

export interface VaccinationApplicationService {
  buildAddDoseDraft: (
    records: readonly ImmunizationSeries[],
    diseaseId: string,
  ) => CompleteDoseDraft;
  buildMarkPlannedDoneDraft: (
    records: readonly ImmunizationSeries[],
    payload: MarkPlannedDonePayload,
  ) => CompleteDoseDraft;
  confirmCountry: (country: CountryCode) => Pick<VaccinationAppState, 'country' | 'isCountryConfirmed'>;
  createDefaults: () => VaccinationAppState;
  loadState: () => VaccinationAppState;
  removeRecord: (
    records: readonly ImmunizationSeries[],
    diseaseId: string,
  ) => VaccinationAppState['records'];
  saveState: (state: VaccinationAppState) => void;
  setCountry: (country: CountryCode) => Pick<VaccinationAppState, 'country'>;
  startEditRecord: (
    records: readonly ImmunizationSeries[],
    diseaseId: string,
  ) => string | null;
  submitCompletedDose: (
    records: readonly ImmunizationSeries[],
    recordInput: ImmunizationDoseInput,
  ) => ValidationOutcome;
  submitRecord: (
    records: readonly ImmunizationSeries[],
    recordInput: ImmunizationSeriesInput,
  ) => ValidationOutcome;
  upsertRecord: (
    records: readonly ImmunizationSeries[],
    recordInput: ImmunizationSeriesInput,
  ) => VaccinationAppState['records'];
}

export const createVaccinationApplicationService = ({
  clock,
  idGenerator,
  repository,
}: {
  clock: VaccinationClock;
  idGenerator: VaccinationIdGenerator;
  repository: VaccinationRepository;
}): VaccinationApplicationService => {
  const useCaseDeps = {
    createDoseId: () => idGenerator.create(),
    getNowIsoDateTime: () => clock.nowIsoDateTime(),
  };

  return {
    buildAddDoseDraft: (records, diseaseId) => buildAddDoseDraft(records, diseaseId),
    buildMarkPlannedDoneDraft: (records, payload) => buildMarkPlannedDoneDraft(records, payload),
    confirmCountry: (country) => confirmCountryUseCase(country),
    createDefaults: () => createVaccinationAppDefaults(),
    loadState: () => loadVaccinationAppState(repository),
    removeRecord: (records, diseaseId) => removeRecordUseCase(records, diseaseId),
    saveState: (state) => {
      saveVaccinationAppState(repository, state);
    },
    setCountry: (country) => setCountryUseCase(country),
    startEditRecord: (records, diseaseId) => startEditRecordUseCase(records, diseaseId),
    submitCompletedDose: (records, recordInput) =>
      submitCompletedDoseUseCase(records, recordInput, useCaseDeps),
    submitRecord: (records, recordInput) =>
      submitRecordUseCase(records, recordInput, useCaseDeps),
    upsertRecord: (records, recordInput) =>
      upsertRecordUseCase(records, recordInput, useCaseDeps),
  };
};

export type { MarkPlannedDonePayload };
