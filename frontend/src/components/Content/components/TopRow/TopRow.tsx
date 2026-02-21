import { useLanguageStore } from 'src/state/language'
import { useShallow } from 'zustand/react/shallow';

import { useDiseaseLabels } from '../../../../hooks/useDiseaseLabels';
import { useDoseModalActions } from '../../../../hooks/useDoseModalActions';
import type { CountryCode } from '../../../../interfaces/base';
import { useInternalHomeUiStore } from '../../../../state/internalHomeUi';
import { useVaccinationStore } from '../../../../state/vaccination';
import { selectTopRowViewData } from '../../../../state/vaccination/selectors';

import { CountrySwitcher } from './components/CountrySwitcher/CountrySwitcher';
import { VaccinationUpcoming } from './components/VaccinationUpcoming/VaccinationUpcoming';

import styles from './TopRow.module.css';

export const TopRow = () => {
  const { language } = useLanguageStore();
  const { resolveDiseaseLabelById } = useDiseaseLabels();
  const { country, recordsDueInNextYear } = useVaccinationStore(useShallow(selectTopRowViewData));
  const {
    setCountry,
  } = useVaccinationStore(
    useShallow((state) => ({
      setCountry: state.setCountry,
    })),
  );
  const resetUi = useInternalHomeUiStore((state) => state.resetUi);
  const { openMarkPlannedDoneModal } = useDoseModalActions();

  if (!country) {
    return null;
  }

  const handleChangeCountry = async (nextCountry: CountryCode) => {
    await setCountry(nextCountry);
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
