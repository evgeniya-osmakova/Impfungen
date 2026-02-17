import type { OAuthConfig } from './types';

const hasRequiredOAuthConfig = (config: OAuthConfig) =>
  Boolean(config.authorizeUrl && config.tokenUrl && config.clientId && config.redirectUri);

export const getOAuthConfig = (): OAuthConfig => {
  const fallbackRedirectUri = `${window.location.origin}${window.location.pathname}`;

  return {
    authorizeUrl: import.meta.env.VITE_OAUTH_AUTHORIZE_URL?.trim() ?? '',
    tokenUrl: import.meta.env.VITE_OAUTH_TOKEN_URL?.trim() ?? '',
    clientId: import.meta.env.VITE_OAUTH_CLIENT_ID?.trim() ?? '',
    redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI?.trim() ?? fallbackRedirectUri,
    scope: import.meta.env.VITE_OAUTH_SCOPE?.trim() ?? '',
  };
};

export const isOAuthConfigured = () => hasRequiredOAuthConfig(getOAuthConfig());

export const assertOAuthConfigured = () => {
  const config = getOAuthConfig();

  if (!hasRequiredOAuthConfig(config)) {
    throw new Error('OAuth configuration is missing.');
  }

  return config;
};
