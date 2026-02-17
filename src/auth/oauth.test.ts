import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearOAuthSession,
  completeOAuthLogin,
  createOAuthAuthorizeUrl,
  getOAuthSession,
} from './oauth';

const originalFetch = globalThis.fetch;

const configureOAuthEnv = () => {
  vi.stubEnv('VITE_OAUTH_AUTHORIZE_URL', 'https://id.example.com/oauth2/authorize');
  vi.stubEnv('VITE_OAUTH_TOKEN_URL', 'https://id.example.com/oauth2/token');
  vi.stubEnv('VITE_OAUTH_CLIENT_ID', 'impfungen-web-client');
  vi.stubEnv('VITE_OAUTH_REDIRECT_URI', 'http://localhost:5173');
  vi.stubEnv('VITE_OAUTH_SCOPE', 'openid profile email');
};

describe('oauth', () => {
  beforeEach(() => {
    configureOAuthEnv();
    clearOAuthSession();
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState(null, document.title, '/');
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  it('creates OAuth authorize URL with PKCE params', async () => {
    const authorizeUrl = await createOAuthAuthorizeUrl();
    const parsedUrl = new URL(authorizeUrl);
    const state = window.sessionStorage.getItem('impfungen.oauth.state');
    const codeVerifier = window.sessionStorage.getItem('impfungen.oauth.verifier');

    expect(parsedUrl.origin).toBe('https://id.example.com');
    expect(parsedUrl.pathname).toBe('/oauth2/authorize');
    expect(parsedUrl.searchParams.get('response_type')).toBe('code');
    expect(parsedUrl.searchParams.get('client_id')).toBe('impfungen-web-client');
    expect(parsedUrl.searchParams.get('redirect_uri')).toBe('http://localhost:5173');
    expect(parsedUrl.searchParams.get('scope')).toBe('openid profile email');
    expect(parsedUrl.searchParams.get('state')).toBe(state);
    expect(parsedUrl.searchParams.get('code_challenge')).toBeTruthy();
    expect(parsedUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(codeVerifier).toBeTruthy();
  });

  it('completes callback and persists OAuth session', async () => {
    window.sessionStorage.setItem('impfungen.oauth.state', 'expected-state');
    window.sessionStorage.setItem('impfungen.oauth.verifier', 'expected-verifier');
    window.history.replaceState(null, document.title, '/?code=auth-code&state=expected-state');
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'access-token-value',
          expires_in: 3600,
          refresh_token: 'refresh-token-value',
          token_type: 'Bearer',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const result = await completeOAuthLogin();
    const session = getOAuthSession();

    expect(result.status).toBe('success');
    expect(session?.accessToken).toBe('access-token-value');
    expect(session?.refreshToken).toBe('refresh-token-value');
    expect(new URL(window.location.href).search).toBe('');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://id.example.com/oauth2/token',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('code_verifier=expected-verifier'),
      }),
    );
  });

  it('returns state mismatch when callback state is invalid', async () => {
    window.sessionStorage.setItem('impfungen.oauth.state', 'expected-state');
    window.sessionStorage.setItem('impfungen.oauth.verifier', 'expected-verifier');
    window.history.replaceState(null, document.title, '/?code=auth-code&state=wrong-state');
    globalThis.fetch = vi.fn();

    const result = await completeOAuthLogin();

    expect(result).toEqual({ status: 'error', code: 'state_mismatch' });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(new URL(window.location.href).search).toBe('');
  });

  it('drops expired stored session', () => {
    window.localStorage.setItem(
      'impfungen.oauth.session',
      JSON.stringify({
        accessToken: 'expired-token',
        createdAt: Date.now() - 2_000,
        expiresAt: Date.now() - 1_000,
        idToken: null,
        refreshToken: null,
        scope: null,
        tokenType: 'Bearer',
      }),
    );

    expect(getOAuthSession()).toBeNull();
    expect(window.localStorage.getItem('impfungen.oauth.session')).toBeNull();
  });
});
