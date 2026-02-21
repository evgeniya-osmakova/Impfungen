import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type ProfileSnapshot,setProfileApi } from '../../api/profileApi';
import i18n from '../../i18n';

import { useLanguageStore } from './index';

const defaultProfileSnapshot: ProfileSnapshot = {
  language: 'ru',
  vaccinationState: {
    country: null,
    records: [],
  },
};

describe('languageStore', () => {
  beforeEach(async () => {
    setProfileApi(null);
    useLanguageStore.setState({ language: 'ru' });
    await i18n.changeLanguage('ru');
  });

  it('persists selected language on backend when api is configured', () => {
    const setLanguage = vi.fn(() => Promise.resolve());

    setProfileApi({
      getProfile: vi.fn(() => Promise.resolve(defaultProfileSnapshot)),
      removeVaccinationRecord: vi.fn(() => Promise.resolve()),
      setLanguage,
      setVaccinationCountry: vi.fn(() => Promise.resolve()),
      upsertVaccinationRecord: vi.fn(() => Promise.resolve({
        ok: true as const,
        updatedAt: '2025-01-10T00:00:00.000Z',
      })),
    });

    useLanguageStore.getState().changeLanguage('en');

    expect(setLanguage).toHaveBeenCalledWith('en');
    expect(useLanguageStore.getState().language).toBe('en');
  });

  it('does nothing when selected language is already active', () => {
    const setLanguage = vi.fn(() => Promise.resolve());

    setProfileApi({
      getProfile: vi.fn(() => Promise.resolve(defaultProfileSnapshot)),
      removeVaccinationRecord: vi.fn(() => Promise.resolve()),
      setLanguage,
      setVaccinationCountry: vi.fn(() => Promise.resolve()),
      upsertVaccinationRecord: vi.fn(() => Promise.resolve({
        ok: true as const,
        updatedAt: '2025-01-10T00:00:00.000Z',
      })),
    });

    useLanguageStore.getState().changeLanguage('ru');

    expect(setLanguage).not.toHaveBeenCalled();
    expect(useLanguageStore.getState().language).toBe('ru');
  });

  it('setLanguage synchronizes i18n language', async () => {
    useLanguageStore.getState().setLanguage('de');

    expect(useLanguageStore.getState().language).toBe('de');
    await vi.waitFor(() => {
      expect(i18n.resolvedLanguage).toBe('de');
    });
  });
});
