import type { VaccinationIdGenerator } from './vaccinationDependencies';

export const systemIdGenerator: VaccinationIdGenerator = {
  create: () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  },
};
