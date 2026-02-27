import { getProfileApi,type ProfileSnapshot } from 'src/api/profileApi.ts';
import type { CountryCode } from 'src/interfaces/base.ts';
import type {
  ImmunizationDoseInput,
  ImmunizationSeriesInput,
} from 'src/interfaces/immunizationRecord.ts';

export const persistSubmittedRecord = async ({
  accountId,
  completedDoseId,
  expectedUpdatedAt,
  recordInput,
}: {
  accountId: number | null;
  completedDoseId: string | null;
  expectedUpdatedAt: string | null;
  recordInput: ImmunizationSeriesInput;
}): Promise<ProfileSnapshot | null> => {
  const api = getProfileApi();

  if (!api || accountId === null) {
    return null;
  }

  return api.submitVaccinationRecord({
    accountId,
    ...recordInput,
    completedDoseId,
    expectedUpdatedAt,
  });
};

export const persistCompletedDose = async ({
  accountId,
  doseId,
  doseInput,
  expectedUpdatedAt,
}: {
  accountId: number | null;
  doseId: string;
  doseInput: ImmunizationDoseInput;
  expectedUpdatedAt: string | null;
}): Promise<ProfileSnapshot | null> => {
  const api = getProfileApi();

  if (!api || accountId === null) {
    return null;
  }

  return api.completeVaccinationDose({
    accountId,
    ...doseInput,
    doseId,
    expectedUpdatedAt,
  });
};

export const persistRemovedRecord = async ({
  accountId,
  diseaseId,
}: {
  accountId: number | null;
  diseaseId: string;
}): Promise<ProfileSnapshot | null> => {
  const api = getProfileApi();

  if (!api || accountId === null) {
    return null;
  }

  return api.removeVaccinationRecord({ accountId, diseaseId });
};

export const persistVaccinationCountry = async ({
  accountId,
  country,
}: {
  accountId: number | null;
  country: CountryCode;
}): Promise<ProfileSnapshot | null> => {
  const api = getProfileApi();

  if (!api || accountId === null) {
    return null;
  }

  return api.setVaccinationCountry({ accountId, country });
};
