import { VACCINATION_DISEASE_CATALOG } from '../constants/vaccinationCatalog';
import type {
  VaccinationCategory,
  VaccinationCountryCode,
  VaccinationDisease,
  VaccinationRecord,
} from '../interfaces/vaccination';
import {
  getAvailableDiseases,
  getCategoryCounts,
  getRecordsWithNextDateCount,
  sortRecordsByNextDueDate,
} from '../utils/vaccinationSelectors';

interface VaccinationStoreViewSource {
  country: VaccinationCountryCode | null;
  editingDiseaseId: string | null;
  records: readonly VaccinationRecord[];
}

interface VaccinationStoreViewData {
  availableDiseases: VaccinationDisease[];
  categoryCounts: Record<VaccinationCategory, number>;
  diseasesForForm: VaccinationDisease[];
  recordForEdit: VaccinationRecord | null;
  recordsForView: VaccinationRecord[];
  recordsWithNextDate: number;
}

const VACCINATION_DISEASES_BY_ID = new Map(
  VACCINATION_DISEASE_CATALOG.map((disease) => [disease.id, disease]),
);

const EMPTY_CATEGORY_COUNTS: Record<VaccinationCategory, number> = {
  optional: 0,
  recommended: 0,
};

const resolveRecordForEdit = (
  records: readonly VaccinationRecord[],
  editingDiseaseId: string | null,
): VaccinationRecord | null => records.find((record) => record.diseaseId === editingDiseaseId) ?? null;

export const getVaccinationDiseaseById = (diseaseId: string): VaccinationDisease | undefined =>
  VACCINATION_DISEASES_BY_ID.get(diseaseId);

export const selectVaccinationViewData = ({
  country,
  editingDiseaseId,
  records,
}: VaccinationStoreViewSource): VaccinationStoreViewData => {
  const recordForEdit = resolveRecordForEdit(records, editingDiseaseId);
  const availableDiseases = country
    ? getAvailableDiseases(VACCINATION_DISEASE_CATALOG, records, country)
    : [];
  const diseaseForEdit = recordForEdit ? getVaccinationDiseaseById(recordForEdit.diseaseId) : undefined;

  return {
    availableDiseases,
    categoryCounts: country ? getCategoryCounts(availableDiseases, country) : EMPTY_CATEGORY_COUNTS,
    diseasesForForm: diseaseForEdit ? [diseaseForEdit, ...availableDiseases] : availableDiseases,
    recordForEdit,
    recordsForView: sortRecordsByNextDueDate(records),
    recordsWithNextDate: getRecordsWithNextDateCount(records),
  };
};
