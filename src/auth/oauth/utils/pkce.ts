const toBase64Url = (bytes: Uint8Array) =>
  window
    .btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '');

export const createRandomString = (size: number) => {
  const bytes = new Uint8Array(size);
  window.crypto.getRandomValues(bytes);

  return toBase64Url(bytes);
};

export const createCodeChallenge = async (verifier: string) => {
  const hash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));

  return toBase64Url(new Uint8Array(hash));
};
