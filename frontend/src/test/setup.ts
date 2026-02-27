import { setProfileApi } from 'src/api/profileApi';
import { useAccountsStore } from 'src/state/accounts';
import { useVaccinationStore } from 'src/state/vaccination';
import { afterEach } from 'vitest';

import '@testing-library/jest-dom';
import 'src/i18n';

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
