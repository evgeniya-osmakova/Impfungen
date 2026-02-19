import type { VaccinationClock } from './vaccinationDependencies';

export const systemClock: VaccinationClock = {
  nowIsoDateTime: () => new Date().toISOString(),
};
