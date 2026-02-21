import type { AppRouter } from '@backend/contracts';
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
type UpsertVaccinationRecordInput = RouterInputs['profile']['upsertVaccinationRecord'];
type UpsertVaccinationRecordOutput = RouterOutputs['profile']['upsertVaccinationRecord'];
type RemoveVaccinationRecordInput = RouterInputs['profile']['removeVaccinationRecord'];

interface ProfileApi {
  getProfile: () => Promise<ProfileSnapshot>;
  removeVaccinationRecord: (diseaseId: RemoveVaccinationRecordInput['diseaseId']) => Promise<void>;
  setLanguage: (language: SetLanguageInput['language']) => Promise<void>;
  setVaccinationCountry: (country: SetVaccinationCountryInput['country']) => Promise<void>;
  upsertVaccinationRecord: (
    record: UpsertVaccinationRecordInput,
  ) => Promise<UpsertVaccinationRecordOutput>;
}

let profileApiSingleton: ProfileApi | null = null;

export const createProfileApi = (): ProfileApi => ({
  getProfile: () => trpc.profile.get.query(),
  removeVaccinationRecord: async (diseaseId) => {
    await trpc.profile.removeVaccinationRecord.mutate({ diseaseId });
  },
  setLanguage: async (language) => {
    await trpc.profile.setLanguage.mutate({ language });
  },
  setVaccinationCountry: async (country) => {
    await trpc.profile.setVaccinationCountry.mutate({ country });
  },
  upsertVaccinationRecord: (record) => trpc.profile.upsertVaccinationRecord.mutate(record),
});

export const setProfileApi = (profileApi: ProfileApi | null): void => {
  profileApiSingleton = profileApi;
};

export const getProfileApi = (): ProfileApi | null => profileApiSingleton;
