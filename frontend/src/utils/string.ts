export const normalizeOptionalText = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  return normalized ? normalized : null;
};
