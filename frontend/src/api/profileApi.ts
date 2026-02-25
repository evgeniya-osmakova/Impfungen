import type { AppRouter } from '@backend/router-types';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

const resolveTrpcBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

  return `${baseUrl.replace(/\/$/, '')}/trpc`;
};

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: resolveTrpcBaseUrl(),
    }),
  ],
});

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ProfileSnapshot = RouterOutputs['profile']['get'];
type SetLanguageInput = RouterInputs['profile']['setLanguage'];
type SetVaccinationCountryInput = RouterInputs['profile']['setVaccinationCountry'];
type SelectAccountInput = RouterInputs['profile']['selectAccount'];
type CreateFamilyAccountInput = RouterInputs['profile']['createFamilyAccount'];
type DeleteFamilyAccountInput = RouterInputs['profile']['deleteFamilyAccount'];
type UpdateAccountInput = RouterInputs['profile']['updateAccount'];
type UpsertVaccinationRecordInput = RouterInputs['profile']['upsertVaccinationRecord'];
type UpsertVaccinationRecordOutput = RouterOutputs['profile']['upsertVaccinationRecord'];
type RemoveVaccinationRecordInput = RouterInputs['profile']['removeVaccinationRecord'];

interface ProfileApi {
  createFamilyAccount: (input: CreateFamilyAccountInput) => Promise<ProfileSnapshot>;
  deleteFamilyAccount: (accountId: DeleteFamilyAccountInput['accountId']) => Promise<ProfileSnapshot>;
  getProfile: () => Promise<ProfileSnapshot>;
  removeVaccinationRecord: (input: RemoveVaccinationRecordInput) => Promise<void>;
  selectAccount: (accountId: SelectAccountInput['accountId']) => Promise<ProfileSnapshot>;
  setLanguage: (language: SetLanguageInput['language']) => Promise<void>;
  setVaccinationCountry: (input: SetVaccinationCountryInput) => Promise<void>;
  updateAccount: (input: UpdateAccountInput) => Promise<ProfileSnapshot>;
  upsertVaccinationRecord: (input: UpsertVaccinationRecordInput) => Promise<UpsertVaccinationRecordOutput>;
}

let profileApiSingleton: ProfileApi | null = null;

export const createProfileApi = (): ProfileApi => ({
  createFamilyAccount: (input) => trpc.profile.createFamilyAccount.mutate(input),
  deleteFamilyAccount: (accountId) => trpc.profile.deleteFamilyAccount.mutate({ accountId }),
  getProfile: () => trpc.profile.get.query(),
  removeVaccinationRecord: async (input) => {
    await trpc.profile.removeVaccinationRecord.mutate(input);
  },
  selectAccount: (accountId) => trpc.profile.selectAccount.mutate({ accountId }),
  setLanguage: async (language) => {
    await trpc.profile.setLanguage.mutate({ language });
  },
  setVaccinationCountry: async (input) => {
    await trpc.profile.setVaccinationCountry.mutate(input);
  },
  updateAccount: (input) => trpc.profile.updateAccount.mutate(input),
  upsertVaccinationRecord: (input) => trpc.profile.upsertVaccinationRecord.mutate(input),
});

export const setProfileApi = (profileApi: ProfileApi | null): void => {
  profileApiSingleton = profileApi;
};

export const getProfileApi = (): ProfileApi | null => profileApiSingleton;
