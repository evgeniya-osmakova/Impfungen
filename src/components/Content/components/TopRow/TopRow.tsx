import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import { useDiseaseLabels } from '../../../../hooks/useDiseaseLabels';
import { useDoseModalActions } from '../../../../hooks/useDoseModalActions';
import { resolveAppLanguage } from '../../../../i18n/resources';
import type { CountryCode } from '../../../../interfaces/base';
import { useInternalHomeUiStore } from '../../../../state/internalHomeUi';
import { useVaccinationStore } from '../../../../state/vaccination';
import { selectVaccinationViewData } from '../../../../state/vaccination/selectors';

import { CountrySwitcher } from './components/CountrySwitcher/CountrySwitcher';
import { VaccinationUpcoming } from './components/VaccinationUpcoming/VaccinationUpcoming';

import styles from './TopRow.module.css';

export const TopRow = () => {
  const { i18n } = useTranslation();
  const language = resolveAppLanguage(i18n.resolvedLanguage);
  const { resolveDiseaseLabelById } = useDiseaseLabels();
  const {
    country,
    editingDiseaseId,
    records,
    setCountry,
  } = useVaccinationStore(
    useShallow((state) => ({
      country: state.country,
      editingDiseaseId: state.editingDiseaseId,
      records: state.records,
      setCountry: state.setCountry,
    })),
  );
  const resetUi = useInternalHomeUiStore((state) => state.resetUi);
  const { openMarkPlannedDoneModal } = useDoseModalActions();

  const { recordsDueInNextYear } = selectVaccinationViewData({
    country,
    editingDiseaseId,
    records,
  });

  if (!country) {
    return null;
  }

  const handleChangeCountry = (nextCountry: CountryCode) => {
    setCountry(nextCountry);
    resetUi();
  };

  return (
    <div className={styles.topRow}>
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
