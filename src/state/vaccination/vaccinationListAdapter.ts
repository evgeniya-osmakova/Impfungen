import type { Disease } from '../../interfaces/disease';

export const sortDiseasesByLabel = (
  diseases: readonly Disease[],
  resolveDiseaseLabel: (disease: Disease) => string,
): Disease[] =>
  [...diseases].sort((leftDisease, rightDisease) =>
    resolveDiseaseLabel(leftDisease).localeCompare(resolveDiseaseLabel(rightDisease)));
