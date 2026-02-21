export const generateId = (): string => {
  if (typeof crypto !== 'undefined') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
