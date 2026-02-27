import { useDiseaseLabels } from 'src/hooks/useDiseaseLabels';
import { useDoseModalActions } from 'src/hooks/useDoseModalActions';
import type { MainPageUi } from 'src/interfaces/mainPageUi.ts';
import { useLanguageStore } from 'src/state/language';
import { useVaccinationStore } from 'src/state/vaccination';
import { selectTopRowViewData } from 'src/state/vaccination/selectors';
import { useShallow } from 'zustand/react/shallow';

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
