import type { DoseKind } from './base';
import type { AppLanguage } from './language';

export interface VaccinationCompletedExportDoseRow {
  batchNumber: string | null;
  completedAt: string;
  formattedCompletedAt: string;
  doseKind: DoseKind;
  doseKindLabel: string;
  tradeName: string | null;
}

export interface VaccinationCompletedExportRow extends VaccinationCompletedExportDoseRow {
  diseaseLabel: string;
}

export interface VaccinationCompletedExportGroup {
  diseaseLabel: string;
  doses: VaccinationCompletedExportDoseRow[];
}

export interface VaccinationCompletedExportMeta {
  exportedAt: Date;
  language: AppLanguage;
  profileName: string;
}

export interface VaccinationCompletedExportColumnLabels {
  batchNumber: string;
  completedAt: string;
  disease: string;
  doseKind: string;
  tradeName: string;
}

export interface VaccinationCompletedExportPdfLabels {
  exportedAtLabel: string;
  profileLabel: string;
  recordsCountLabel: string;
  title: string;
}
