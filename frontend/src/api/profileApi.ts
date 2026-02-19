import type { AppRouter } from '@backend/router';
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
type SaveVaccinationStateInput = RouterInputs['profile']['saveVaccinationState'];

interface ProfileApi {
  getProfile: () => Promise<ProfileSnapshot>;
  saveVaccinationState: (state: SaveVaccinationStateInput) => Promise<void>;
  setLanguage: (language: SetLanguageInput['language']) => Promise<void>;
}

let profileApiSingleton: ProfileApi | null = null;

export const createProfileApi = (): ProfileApi => ({
  getProfile: () => trpc.profile.get.query(),
  saveVaccinationState: async (state) => {
    await trpc.profile.saveVaccinationState.mutate(state);
  },
  setLanguage: async (language) => {
    await trpc.profile.setLanguage.mutate({ language });
  },
});

export const setProfileApi = (profileApi: ProfileApi | null): void => {
  profileApiSingleton = profileApi;
};

export const getProfileApi = (): ProfileApi | null => profileApiSingleton;
