import {
  toVaccinationRecordCardViews,
} from 'src/helpers/vaccinationViewModel.ts';
import type {
  VaccinationStoreViewData,
} from 'src/interfaces/vaccinationViewData.ts';

import { VACCINATION_DISEASE_CATALOG } from '../../constants/vaccinationCatalog';
import type { Category, CountryCode } from '../../interfaces/base';
import type { Disease } from '../../interfaces/disease';
import type { ImmunizationSeries } from '../../interfaces/immunizationRecord';
import {
  getAvailableDiseases,
  getCategoryCounts,
  getRecordsDueInNextYear,
  getRecordsWithNextDateCount,
  sortRecordsByNextDueDate,
} from '../../utils/vaccinationSelectors';

interface VaccinationStoreViewSource {
  country: CountryCode | null;
  editingDiseaseId: string | null;
  records: readonly ImmunizationSeries[];
}

const VACCINATION_DISEASES_BY_ID = new Map(
  VACCINATION_DISEASE_CATALOG.map((disease) => [disease.id, disease]),
);

const EMPTY_CATEGORY_COUNTS: Record<Category, number> = {
  optional: 0,
  recommended: 0,
};

const resolveRecordForEdit = (
  records: readonly ImmunizationSeries[],
  editingDiseaseId: string | null,
): ImmunizationSeries | null => records.find((record) => record.diseaseId === editingDiseaseId) ?? null;

export const getVaccinationDiseaseById = (diseaseId: string): Disease | undefined =>
  VACCINATION_DISEASES_BY_ID.get(diseaseId);

export const selectVaccinationViewData = ({
  country,
  editingDiseaseId,
  records,
}: VaccinationStoreViewSource): VaccinationStoreViewData => {
  const recordForEdit = resolveRecordForEdit(records, editingDiseaseId);
  const sortedRecordsByNextDueDate = sortRecordsByNextDueDate(records);
  const recordsForView = toVaccinationRecordCardViews(sortedRecordsByNextDueDate);
  const availableDiseases = country
    ? getAvailableDiseases(VACCINATION_DISEASE_CATALOG, records, country)
    : [];
  const diseaseForEdit = recordForEdit ? getVaccinationDiseaseById(recordForEdit.diseaseId) : undefined;

  return {
    availableDiseases,
    categoryCounts: country ? getCategoryCounts(availableDiseases, country) : EMPTY_CATEGORY_COUNTS,
    diseasesForForm: diseaseForEdit ? [diseaseForEdit, ...availableDiseases] : availableDiseases,
    recordForEdit,
    recordsDueInNextYear: getRecordsDueInNextYear(sortedRecordsByNextDueDate),
    recordsForView,
    recordsWithNextDate: getRecordsWithNextDateCount(records),
  };
};
