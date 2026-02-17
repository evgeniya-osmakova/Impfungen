import type { OAuthConfig, TokenExchangePayload } from './types';

export const createTokenExchangeBody = ({
  clientId,
  code,
  codeVerifier,
  redirectUri,
}: TokenExchangePayload) => {
  const body = new URLSearchParams();
  body.set('grant_type', 'authorization_code');
  body.set('client_id', clientId);
  body.set('redirect_uri', redirectUri);
  body.set('code', code);
  body.set('code_verifier', codeVerifier);

  return body.toString();
};

interface RequestTokenExchangePayload {
  code: string;
  codeVerifier: string;
  config: OAuthConfig;
}

export const requestTokenExchange = ({ code, codeVerifier, config }: RequestTokenExchangePayload) =>
  fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: createTokenExchangeBody({
      clientId: config.clientId,
      code,
      codeVerifier,
      redirectUri: config.redirectUri,
    }),
  });
