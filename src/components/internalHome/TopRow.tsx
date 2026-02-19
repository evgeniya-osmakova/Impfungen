import { useTranslation } from 'react-i18next';

import { resolveAppLanguage } from '../../i18n/resources';
import type { VaccinationCountryCode } from '../../interfaces/vaccination';
import { useInternalHomeUiStore } from '../../store/internalHomeUiStore';
import { useVaccinationStore } from '../../store/vaccinationStore';
import { selectVaccinationViewData } from '../../store/vaccinationStoreSelectors';

import { CountrySwitcher } from './CountrySwitcher';
import { useDiseaseLabels } from './useDiseaseLabels';
import { useDoseModalActions } from './useDoseModalActions';
import { VaccinationUpcoming } from './VaccinationUpcoming';

import styles from './Content.module.css';

export const TopRow = () => {
  const { i18n } = useTranslation();
  const { resolveDiseaseLabelById } = useDiseaseLabels();
  const { country, editingDiseaseId, records, setCountry } = useVaccinationStore();
  const { resetUi } = useInternalHomeUiStore();
  const { openMarkPlannedDoneModal } = useDoseModalActions();
  const language = resolveAppLanguage(i18n.resolvedLanguage);

  const { recordsDueInNextYear } = selectVaccinationViewData({
    country,
    editingDiseaseId,
    records,
  });

  if (!country) {
    return null;
  }

  const handleChangeCountry = (nextCountry: VaccinationCountryCode) => {
    setCountry(nextCountry);
    resetUi();
  };

  return (
    <div className={styles.internalHomeContent__topRow}>
      <CountrySwitcher country={country} onChangeCountry={handleChangeCountry} />
      <VaccinationUpcoming
        language={language}
        onMarkPlannedDone={openMarkPlannedDoneModal}
        records={recordsDueInNextYear}
        resolveDiseaseLabelById={resolveDiseaseLabelById}
      />
    </div>
  );
};
