const defaultDatabaseUrl = 'postgres://postgres:postgres@localhost:5432/impfungen';

const readString = (
  name: string,
  fallback: string,
): string => {
  const value = process.env[name];

  if (!value || !value.trim()) {
    return fallback;
  }

  return value;
};

const readNumber = (
  name: string,
  fallback: number,
): number => {
  const value = process.env[name];
  const parsedValue = value ? Number.parseInt(value, 10) : Number.NaN;

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return parsedValue;
};

export const env = {
  CORS_ORIGIN: readString('CORS_ORIGIN', '*'),
  DATABASE_URL: readString('DATABASE_URL', defaultDatabaseUrl),
  HOST: readString('HOST', '0.0.0.0'),
  PORT: readNumber('PORT', 3000),
};
