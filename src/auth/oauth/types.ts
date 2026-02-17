export interface OAuthConfig {
  authorizeUrl: string;
  tokenUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string;
}

export interface OAuthTokenResponse {
  access_token?: unknown;
  expires_in?: unknown;
  id_token?: unknown;
  refresh_token?: unknown;
  scope?: unknown;
  token_type?: unknown;
}

export interface TokenExchangePayload {
  clientId: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
}
