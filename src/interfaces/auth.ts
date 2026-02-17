export type OAuthCallbackErrorCode =
  | 'provider_error'
  | 'state_mismatch'
  | 'missing_verifier'
  | 'exchange_failed'
  | 'missing_access_token';

export interface OAuthSession {
  accessToken: string;
  createdAt: number;
  expiresAt: number | null;
  idToken: string | null;
  refreshToken: string | null;
  scope: string | null;
  tokenType: string | null;
}

export interface OAuthCallbackIdleResult {
  status: 'idle';
}

export interface OAuthCallbackSuccessResult {
  status: 'success';
  session: OAuthSession;
}

export interface OAuthCallbackErrorResult {
  status: 'error';
  code: OAuthCallbackErrorCode;
  details?: string;
}

export type OAuthCallbackResult =
  | OAuthCallbackIdleResult
  | OAuthCallbackSuccessResult
  | OAuthCallbackErrorResult;

export type AuthErrorCode = OAuthCallbackErrorCode | 'config_missing' | 'unexpected';

export interface AuthError {
  code: AuthErrorCode;
  details?: string;
}
