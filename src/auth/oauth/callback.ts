export const clearCallbackQueryParameters = () => {
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState(window.history.state, document.title, url.toString());
};

export const parseOAuthProviderDetails = (params: URLSearchParams) => {
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
