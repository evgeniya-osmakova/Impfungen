export type VaccinationTimelineStatus = keyof typeof import('../constants/vaccination').VACCINATION_TIMELINE_STATUS;

export interface VaccinationTimelineMeta {
  daysUntil: number;
  status: VaccinationTimelineStatus;
}
