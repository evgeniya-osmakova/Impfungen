export const toIsoDateTime = (
  value: Date | string,
): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return new Date().toISOString();
  }

  return new Date(timestamp).toISOString();
};

export const normalizeIsoDateTime = (
  value: string,
): string | null => {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp).toISOString();
};

export const toIsoDate = (
  value: Date | string,
): string => {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
};
