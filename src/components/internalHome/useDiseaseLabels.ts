import { useTranslation } from 'react-i18next';

import type { VaccinationDisease } from '../../interfaces/vaccination';
import { getVaccinationDiseaseById } from '../../store/vaccinationStoreSelectors';

export const useDiseaseLabels = () => {
  const { t } = useTranslation();
  const resolveDiseaseLabel = (disease: VaccinationDisease) => t(disease.labelKey);

  const resolveDiseaseLabelById = (diseaseId: string): string => {
    const disease = getVaccinationDiseaseById(diseaseId);

    if (!disease) {
      return diseaseId;
    }

    return resolveDiseaseLabel(disease);
  };

  return {
    resolveDiseaseLabel,
    resolveDiseaseLabelById,
    t,
  };
};
