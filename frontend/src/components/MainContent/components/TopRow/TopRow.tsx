import type { MainPageUi } from 'src/interfaces/mainPageUi.ts';
import { useLanguageStore } from 'src/state/language'
import { useShallow } from 'zustand/react/shallow';

import { useDiseaseLabels } from '../../../../hooks/useDiseaseLabels';
import { useDoseModalActions } from '../../../../hooks/useDoseModalActions';
import { useVaccinationStore } from '../../../../state/vaccination';
import { selectTopRowViewData } from '../../../../state/vaccination/selectors';

import { VaccinationUpcoming } from './components/VaccinationUpcoming/VaccinationUpcoming';

import styles from './TopRow.module.css';

interface TopRowProps {
  ui: Pick<MainPageUi, 'openCompleteDoseModal'>;
}

export const TopRow = ({ ui }: TopRowProps) => {
  const { language } = useLanguageStore();
  const { resolveDiseaseLabelById } = useDiseaseLabels();
  const { country, records } = useVaccinationStore(
    useShallow((state) => ({
      country: state.country,
      records: state.records,
    })),
  );
  const { recordsDueInNextYear } = selectTopRowViewData({
    country,
    editingDiseaseId: null,
    records,
  });
  const { openMarkPlannedDoneModal } = useDoseModalActions({
    openCompleteDoseModal: ui.openCompleteDoseModal,
  });

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
