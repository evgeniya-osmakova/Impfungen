import { afterEach } from 'vitest';

import { setProfileApi } from '../api/profileApi';

import '@testing-library/jest-dom';
import '../i18n';

afterEach(() => {
  setProfileApi(null);
});
