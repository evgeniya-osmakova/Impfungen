import type { CountryCode } from '@backend/contracts';
import type { VaccinationState } from 'src/interfaces/vaccinationState';
import { create } from 'zustand';

interface VaccinationStore extends VaccinationState {
  activeAccountId: number | null;
  replaceRecords: (records: VaccinationState['records']) => void;
  setActiveAccountId: (accountId: number | null) => void;
  setCountryLocal: (country: CountryCode) => void;
  setVaccinationStoreState: (store: VaccinationState) => void;
}

export const useVaccinationStore = create<VaccinationStore>((set) => ({
  activeAccountId: null,
  country: null,
  records: [],
  replaceRecords: (records) => {
    set({ records });
  },
  setActiveAccountId: (activeAccountId) => {
    set({ activeAccountId });
  },
  setCountryLocal: (country) => {
    set({ country });
  },
  setVaccinationStoreState: (store) => {
    set(store);
  },
}));
