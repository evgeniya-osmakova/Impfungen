import { createProfileApi, setProfileApi } from 'src/api/profileApi.ts'
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

      const { setVaccinationStoreState } = useVaccinationStore.getState();
      setVaccinationStoreState(profile.vaccinationState);
      set({ isLoaded: true });
    } catch (e) {
      console.error('Unable to load profile.', e);
      set({ isError: true });
    }
  },
}));
