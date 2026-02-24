import { useLanguageStore } from 'src/state/language'
import { useShallow } from 'zustand/react/shallow';

import { useDiseaseLabels } from '../../../../hooks/useDiseaseLabels';
import { useDoseModalActions } from '../../../../hooks/useDoseModalActions';
import { useVaccinationStore } from '../../../../state/vaccination';
import { selectTopRowViewData } from '../../../../state/vaccination/selectors';

import { VaccinationUpcoming } from './components/VaccinationUpcoming/VaccinationUpcoming';

import styles from './TopRow.module.css';

export const TopRow = () => {
  const { language } = useLanguageStore();
  const { resolveDiseaseLabelById } = useDiseaseLabels();
  const { country, recordsDueInNextYear } = useVaccinationStore(useShallow(selectTopRowViewData));
  const { openMarkPlannedDoneModal } = useDoseModalActions();

  if (!country) {
    return null;
  }

  return (
    <div className={styles.topRow}>
      <VaccinationUpcoming
        language={language}
        onMarkPlannedDone={openMarkPlannedDoneModal}
        records={recordsDueInNextYear}
        resolveDiseaseLabelById={resolveDiseaseLabelById}
      />
    </div>
  );
};
