import { afterEach } from 'vitest';

import { setProfileApi } from '../api/profileApi';
import { useAccountsStore } from '../state/accounts';
import { useVaccinationStore } from '../state/vaccination';

import '@testing-library/jest-dom';
import '../i18n';

afterEach(() => {
  setProfileApi(null);
  useAccountsStore.setState({
    accounts: [],
    selectedAccountId: null,
  });
  useVaccinationStore.setState({
    activeAccountId: null,
  });
});
