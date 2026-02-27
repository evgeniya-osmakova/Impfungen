import { useTranslation } from 'react-i18next';
import type { Disease } from 'src/interfaces/disease';
import { getVaccinationDiseaseById } from 'src/state/vaccination/selectors';

export const useDiseaseLabels = () => {
  const { t } = useTranslation();
  const resolveDiseaseLabel = (disease: Disease) => t(disease.labelKey);

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
