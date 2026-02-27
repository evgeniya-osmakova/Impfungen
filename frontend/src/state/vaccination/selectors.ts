import { VACCINATION_DISEASE_CATALOG } from 'src/constants/vaccinationCatalog';
import { toVaccinationRecordCardViews } from 'src/helpers/vaccinationViewModel.ts';
import type { Category, CountryCode } from 'src/interfaces/base';
import type { Disease } from 'src/interfaces/disease';
import type { ImmunizationSeries } from 'src/interfaces/immunizationRecord';
import type { VaccinationStoreViewData } from 'src/interfaces/vaccinationViewData.ts';
import {
  getAvailableDiseases,
  getCategoryCounts,
  getRecordsDueInNextYear,
  getRecordsWithNextDateCount,
  sortRecordsByNextDueDate,
} from 'src/utils/vaccinationSelectors';

interface VaccinationStoreViewSource {
  country: CountryCode | null;
  editingDiseaseId: string | null;
  records: readonly ImmunizationSeries[];
}

interface WorkspaceViewData {
  country: CountryCode | null;
  recordsForView: VaccinationStoreViewData['recordsForView'];
}

interface TopRowViewData {
  country: CountryCode | null;
  recordsDueInNextYear: VaccinationStoreViewData['recordsDueInNextYear'];
}

interface CatalogViewData {
  availableDiseases: VaccinationStoreViewData['availableDiseases'];
  categoryCounts: VaccinationStoreViewData['categoryCounts'];
  country: CountryCode | null;
}

interface ModalsViewData {
  diseasesForForm: VaccinationStoreViewData['diseasesForForm'];
  recordForEdit: VaccinationStoreViewData['recordForEdit'];
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
): ImmunizationSeries | null =>
  records.find((record) => record.diseaseId === editingDiseaseId) ?? null;

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
  const diseaseForEdit = recordForEdit
    ? getVaccinationDiseaseById(recordForEdit.diseaseId)
    : undefined;

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

type VaccinationViewDataProjector = (
  source: VaccinationStoreViewSource,
) => VaccinationStoreViewData;

export const createMemoizedVaccinationViewDataProjector = (
  projector: VaccinationViewDataProjector = selectVaccinationViewData,
): VaccinationViewDataProjector => {
  let cachedCountry: CountryCode | null | undefined;
  let cachedEditingDiseaseId: string | null | undefined;
  let cachedRecords: readonly ImmunizationSeries[] | null = null;
  let cachedValue: VaccinationStoreViewData | null = null;

  return (source) => {
    if (
      cachedValue &&
      cachedCountry === source.country &&
      cachedEditingDiseaseId === source.editingDiseaseId &&
      cachedRecords === source.records
    ) {
      return cachedValue;
    }

    const nextValue = projector(source);

    cachedCountry = source.country;
    cachedEditingDiseaseId = source.editingDiseaseId;
    cachedRecords = source.records;
    cachedValue = nextValue;

    return nextValue;
  };
};

export const createVaccinationStoreSelectors = (
  projectVaccinationViewData: VaccinationViewDataProjector = createMemoizedVaccinationViewDataProjector(),
) => {
  const selectVaccinationViewDataFromStore = (
    state: VaccinationStoreViewSource,
  ): VaccinationStoreViewData => projectVaccinationViewData(state);

  const selectWorkspaceViewData = (state: VaccinationStoreViewSource): WorkspaceViewData => {
    const viewData = selectVaccinationViewDataFromStore(state);

    return {
      country: state.country,
      recordsForView: viewData.recordsForView,
    };
  };

  const selectTopRowViewData = (state: VaccinationStoreViewSource): TopRowViewData => {
    const viewData = selectVaccinationViewDataFromStore(state);

    return {
      country: state.country,
      recordsDueInNextYear: viewData.recordsDueInNextYear,
    };
  };

  const selectCatalogViewData = (state: VaccinationStoreViewSource): CatalogViewData => {
    const viewData = selectVaccinationViewDataFromStore(state);

    return {
      availableDiseases: viewData.availableDiseases,
      categoryCounts: viewData.categoryCounts,
      country: state.country,
    };
  };

  const selectModalsViewData = (state: VaccinationStoreViewSource): ModalsViewData => {
    const viewData = selectVaccinationViewDataFromStore(state);

    return {
      diseasesForForm: viewData.diseasesForForm,
      recordForEdit: viewData.recordForEdit,
    };
  };

  return {
    selectCatalogViewData,
    selectModalsViewData,
    selectTopRowViewData,
    selectVaccinationViewDataFromStore,
    selectWorkspaceViewData,
  };
};

const storeSelectors = createVaccinationStoreSelectors();

export const selectWorkspaceViewData = storeSelectors.selectWorkspaceViewData;
export const selectTopRowViewData = storeSelectors.selectTopRowViewData;
export const selectCatalogViewData = storeSelectors.selectCatalogViewData;
export const selectModalsViewData = storeSelectors.selectModalsViewData;
