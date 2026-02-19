import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type ProfileSnapshot,setProfileApi } from '../../api/profileApi';
import i18n from '../../i18n';

import { useLanguageStore } from './index';

const defaultProfileSnapshot: ProfileSnapshot = {
  language: 'ru',
  vaccinationState: {
    country: null,
    isCountryConfirmed: false,
    records: [],
  },
};

describe('languageStore', () => {
  beforeEach(async () => {
    setProfileApi(null);
    await i18n.changeLanguage('ru');
  });

  it('persists selected language on backend when api is configured', () => {
    const setLanguage = vi.fn(() => Promise.resolve());

    setProfileApi({
      getProfile: vi.fn(() => Promise.resolve(defaultProfileSnapshot)),
      saveVaccinationState: vi.fn(() => Promise.resolve()),
      setLanguage,
    });

    useLanguageStore.getState().changeLanguage('en');

    expect(setLanguage).toHaveBeenCalledWith('en');
  });

  it('does nothing when selected language is already active', () => {
    const setLanguage = vi.fn(() => Promise.resolve());

    setProfileApi({
      getProfile: vi.fn(() => Promise.resolve(defaultProfileSnapshot)),
      saveVaccinationState: vi.fn(() => Promise.resolve()),
      setLanguage,
    });

    useLanguageStore.getState().changeLanguage('ru');

    expect(setLanguage).not.toHaveBeenCalled();
  });
});
