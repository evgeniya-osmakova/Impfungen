import type { OAuthSession } from '../../interfaces/auth';

import { asNumber, asString } from './utils/parsers';
import type { OAuthTokenResponse } from './types';

const OAUTH_STATE_STORAGE_KEY = 'impfungen.oauth.state';
const OAUTH_VERIFIER_STORAGE_KEY = 'impfungen.oauth.verifier';
const OAUTH_SESSION_STORAGE_KEY = 'impfungen.oauth.session';

interface OAuthChallengeArtifacts {
  codeVerifier: string;
  state: string;
}

export const storeOAuthChallengeArtifacts = ({ codeVerifier, state }: OAuthChallengeArtifacts) => {
  window.sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, state);
  window.sessionStorage.setItem(OAUTH_VERIFIER_STORAGE_KEY, codeVerifier);
};

export const getExpectedOAuthState = () => window.sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY);

export const getStoredOAuthVerifier = () => window.sessionStorage.getItem(OAUTH_VERIFIER_STORAGE_KEY);

export const clearOAuthArtifacts = () => {
  window.sessionStorage.removeItem(OAUTH_STATE_STORAGE_KEY);
  window.sessionStorage.removeItem(OAUTH_VERIFIER_STORAGE_KEY);
};

export const persistOAuthSession = (tokenResponse: OAuthTokenResponse) => {
  const accessToken = asString(tokenResponse.access_token);

  if (!accessToken) {
    return null;
  }

  const expiresIn = asNumber(tokenResponse.expires_in);
  const session: OAuthSession = {
    accessToken,
    createdAt: Date.now(),
    expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
    idToken: asString(tokenResponse.id_token),
    refreshToken: asString(tokenResponse.refresh_token),
    scope: asString(tokenResponse.scope),
    tokenType: asString(tokenResponse.token_type),
  };

  window.localStorage.setItem(OAUTH_SESSION_STORAGE_KEY, JSON.stringify(session));

  return session;
};

export const getOAuthSession = (): OAuthSession | null => {
  const rawSession = window.localStorage.getItem(OAUTH_SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as OAuthSession;

    if (!session.accessToken) {
      window.localStorage.removeItem(OAUTH_SESSION_STORAGE_KEY);

      return null;
    }

    if (session.expiresAt && session.expiresAt <= Date.now()) {
      window.localStorage.removeItem(OAUTH_SESSION_STORAGE_KEY);

      return null;
    }

    return session;
  } catch {
    window.localStorage.removeItem(OAUTH_SESSION_STORAGE_KEY);

    return null;
  }
};

export const clearOAuthSession = () => {
  window.localStorage.removeItem(OAUTH_SESSION_STORAGE_KEY);
};
