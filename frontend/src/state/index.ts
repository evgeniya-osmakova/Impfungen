import { createProfileApi, setProfileApi } from 'src/api/profileApi.ts'
import { useAccountsStore } from 'src/state/accounts';
import { useLanguageStore } from 'src/state/language'
import { useVaccinationStore } from 'src/state/vaccination'
import { create } from 'zustand'

interface Store {
  isLoaded: boolean;
  isError: boolean;
  loadStore: () => Promise<void>
}


export const useStore = create<Store>((set) => ({
  isError: false,
  isLoaded: false,
  loadStore: async () => {
    const api = createProfileApi();
    setProfileApi(api);

    try {
      const profile = await api.getProfile();

      const { setLanguage } = useLanguageStore.getState();
      setLanguage(profile.language);

      const { setAccountsState } = useAccountsStore.getState();
      setAccountsState(profile.accountsState);

      const { setVaccinationStoreState } = useVaccinationStore.getState();
      const { setActiveAccountId } = useVaccinationStore.getState();
      setActiveAccountId(profile.accountsState.selectedAccountId);
      setVaccinationStoreState(profile.vaccinationState);
      set({ isLoaded: true });
    } catch (e) {
      console.error('Unable to load profile.', e);
      set({ isError: true });
    }
  },
}));
