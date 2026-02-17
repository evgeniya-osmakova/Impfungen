import type { OAuthCallbackResult, OAuthSession } from '../interfaces/auth';

const OAUTH_STATE_STORAGE_KEY = 'impfungen.oauth.state';
const OAUTH_VERIFIER_STORAGE_KEY = 'impfungen.oauth.verifier';
const OAUTH_SESSION_STORAGE_KEY = 'impfungen.oauth.session';

interface OAuthConfig {
  authorizeUrl: string;
  tokenUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string;
}

interface OAuthTokenResponse {
  access_token?: unknown;
  expires_in?: unknown;
  id_token?: unknown;
  refresh_token?: unknown;
  scope?: unknown;
  token_type?: unknown;
}

const asString = (value: unknown) => (typeof value === 'string' ? value : null);

const asNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const getOAuthConfig = (): OAuthConfig => {
  const fallbackRedirectUri = `${window.location.origin}${window.location.pathname}`;

  return {
    authorizeUrl: import.meta.env.VITE_OAUTH_AUTHORIZE_URL?.trim() ?? '',
    tokenUrl: import.meta.env.VITE_OAUTH_TOKEN_URL?.trim() ?? '',
    clientId: import.meta.env.VITE_OAUTH_CLIENT_ID?.trim() ?? '',
    redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI?.trim() ?? fallbackRedirectUri,
    scope: import.meta.env.VITE_OAUTH_SCOPE?.trim() ?? '',
  };
};

export const isOAuthConfigured = () => {
  const config = getOAuthConfig();

  return Boolean(config.authorizeUrl && config.tokenUrl && config.clientId && config.redirectUri);
};

const assertOAuthConfigured = () => {
  const config = getOAuthConfig();

  if (!isOAuthConfigured()) {
    throw new Error('OAuth configuration is missing.');
  }

  return config;
};

const toBase64Url = (bytes: Uint8Array) =>
  window
    .btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '');

const createRandomString = (size: number) => {
  const bytes = new Uint8Array(size);
  window.crypto.getRandomValues(bytes);

  return toBase64Url(bytes);
};

const createCodeChallenge = async (verifier: string) => {
  const hash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));

  return toBase64Url(new Uint8Array(hash));
};

interface TokenExchangePayload {
  clientId: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

const clearOAuthArtifacts = () => {
  window.sessionStorage.removeItem(OAUTH_STATE_STORAGE_KEY);
  window.sessionStorage.removeItem(OAUTH_VERIFIER_STORAGE_KEY);
};

const clearCallbackQueryParameters = () => {
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState(window.history.state, document.title, url.toString());
};

const persistOAuthSession = (tokenResponse: OAuthTokenResponse) => {
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

export const createOAuthAuthorizeUrl = async () => {
  const config = assertOAuthConfigured();
  const state = createRandomString(32);
  const codeVerifier = createRandomString(64);
  const codeChallenge = await createCodeChallenge(codeVerifier);

  window.sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, state);
  window.sessionStorage.setItem(OAUTH_VERIFIER_STORAGE_KEY, codeVerifier);

  const url = new URL(config.authorizeUrl);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');

  if (config.scope) {
    url.searchParams.set('scope', config.scope);
  }

  return url.toString();
};

export const beginOAuthLogin = async () => {
  const authorizeUrl = await createOAuthAuthorizeUrl();
  window.location.assign(authorizeUrl);
};

const createTokenExchangeBody = ({ clientId, code, codeVerifier, redirectUri }: TokenExchangePayload) => {
  const body = new URLSearchParams();
  body.set('grant_type', 'authorization_code');
  body.set('client_id', clientId);
  body.set('redirect_uri', redirectUri);
  body.set('code', code);
  body.set('code_verifier', codeVerifier);

  return body.toString();
};

const parseOAuthProviderDetails = (params: URLSearchParams) => {
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  if (!error && !errorDescription) {
    return undefined;
  }

  if (!error) {
    return errorDescription ?? undefined;
  }

  if (!errorDescription) {
    return error;
  }

  return `${error}: ${errorDescription}`;
};

export const completeOAuthLogin = async (): Promise<OAuthCallbackResult> => {
  const params = new URLSearchParams(window.location.search);
  const providerError = params.get('error');
  const code = params.get('code');

  if (!providerError && !code) {
    return { status: 'idle' };
  }

  if (providerError) {
    clearOAuthArtifacts();
    clearCallbackQueryParameters();

    return {
      status: 'error',
      code: 'provider_error',
      details: parseOAuthProviderDetails(params),
    };
  }

  const expectedState = window.sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY);
  const callbackState = params.get('state');

  if (!expectedState || !callbackState || expectedState !== callbackState) {
    clearOAuthArtifacts();
    clearCallbackQueryParameters();

    return { status: 'error', code: 'state_mismatch' };
  }

  const codeVerifier = window.sessionStorage.getItem(OAUTH_VERIFIER_STORAGE_KEY);

  if (!codeVerifier) {
    clearOAuthArtifacts();
    clearCallbackQueryParameters();

    return { status: 'error', code: 'missing_verifier' };
  }

  const authCode = params.get('code');

  if (!authCode) {
    clearOAuthArtifacts();
    clearCallbackQueryParameters();

    return {
      status: 'error',
      code: 'exchange_failed',
      details: 'Authorization code is missing in callback parameters.',
    };
  }

  try {
    const config = assertOAuthConfigured();
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: createTokenExchangeBody({
        clientId: config.clientId,
        code: authCode,
        codeVerifier,
        redirectUri: config.redirectUri,
      }),
    });

    if (!response.ok) {
      const responseText = (await response.text()).trim();

      clearOAuthArtifacts();
      clearCallbackQueryParameters();

      return {
        status: 'error',
        code: 'exchange_failed',
        details: responseText || `Token endpoint responded with HTTP ${response.status}.`,
      };
    }

    const tokenResponse = (await response.json()) as OAuthTokenResponse;
    const session = persistOAuthSession(tokenResponse);

    clearOAuthArtifacts();
    clearCallbackQueryParameters();

    if (!session) {
      return { status: 'error', code: 'missing_access_token' };
    }

    return { status: 'success', session };
  } catch (error: unknown) {
    clearOAuthArtifacts();
    clearCallbackQueryParameters();

    return {
      status: 'error',
      code: 'exchange_failed',
      details: error instanceof Error ? error.message : 'Unknown OAuth exchange error.',
    };
  }
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
