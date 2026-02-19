export interface VaccinationClock {
  nowIsoDateTime: () => string;
}

export interface VaccinationIdGenerator {
  create: () => string;
}
