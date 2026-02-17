import type { AuthErrorCode } from '../interfaces/auth';

export const AUTH_ERROR_TRANSLATION_KEY_BY_CODE: Record<AuthErrorCode, string> = {
  config_missing: 'auth.errors.configMissing',
  exchange_failed: 'auth.errors.exchangeFailed',
  missing_access_token: 'auth.errors.missingAccessToken',
  missing_verifier: 'auth.errors.missingVerifier',
  provider_error: 'auth.errors.providerError',
  state_mismatch: 'auth.errors.stateMismatch',
  unexpected: 'auth.errors.unexpected',
};
