import type { OAuthCallbackResult } from '../../interfaces/auth';

import { createCodeChallenge, createRandomString } from './utils/pkce';
import { clearCallbackQueryParameters, parseOAuthProviderDetails } from './callback';
import { assertOAuthConfigured } from './config';
import {
  clearOAuthArtifacts,
  getExpectedOAuthState,
  getStoredOAuthVerifier,
  persistOAuthSession,
  storeOAuthChallengeArtifacts,
} from './storage';
import { requestTokenExchange } from './token-client';
import type { OAuthTokenResponse } from './types';

export const createOAuthAuthorizeUrl = async () => {
  const config = assertOAuthConfigured();
  const state = createRandomString(32);
  const codeVerifier = createRandomString(64);
  const codeChallenge = await createCodeChallenge(codeVerifier);

  storeOAuthChallengeArtifacts({ codeVerifier, state });

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

  const expectedState = getExpectedOAuthState();
  const callbackState = params.get('state');

  if (!expectedState || !callbackState || expectedState !== callbackState) {
    clearOAuthArtifacts();
    clearCallbackQueryParameters();

    return { status: 'error', code: 'state_mismatch' };
  }

  const codeVerifier = getStoredOAuthVerifier();

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
    const response = await requestTokenExchange({
      code: authCode,
      codeVerifier,
      config,
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
