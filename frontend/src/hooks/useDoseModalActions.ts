import { buildAddDoseDraft, buildMarkPlannedDoneDraft } from 'src/state/vaccination/completeDoseDraft.ts'

import type { DoseKind } from '../interfaces/base';
import { useMainPageUiStore } from 'src/state/mainPageUi';
import { useVaccinationStore } from '../state/vaccination';

interface MarkPlannedDonePayload {
  diseaseId: string;
  dueAt: string;
  kind: DoseKind;
  plannedDoseId: string | null;
}

export const useDoseModalActions = () => {
  const records = useVaccinationStore((state) => state.records);
  const openCompleteDoseModal = useMainPageUiStore((state) => state.openCompleteDoseModal);

  const openAddDoseModal = (diseaseId: string) => {
    openCompleteDoseModal(buildAddDoseDraft(records, diseaseId));
  };

  const openMarkPlannedDoneModal = ({
    diseaseId,
    dueAt,
    kind,
    plannedDoseId,
  }: MarkPlannedDonePayload) => {
    openCompleteDoseModal(
      buildMarkPlannedDoneDraft(records, {
        diseaseId,
        dueAt,
        kind,
        plannedDoseId,
      }),
    );
  };

  return {
    openAddDoseModal,
    openMarkPlannedDoneModal,
  };
};
