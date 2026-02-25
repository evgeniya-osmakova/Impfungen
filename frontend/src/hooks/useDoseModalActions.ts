import { buildAddDoseDraft, buildMarkPlannedDoneDraft } from 'src/state/vaccination/completeDoseDraft.ts'

import type { DoseKind } from '../interfaces/base';
import type { CompleteDoseDraft } from '../interfaces/completeDoseDraft';
import { useVaccinationStore } from '../state/vaccination';

interface MarkPlannedDonePayload {
  diseaseId: string;
  dueAt: string;
  kind: DoseKind;
  plannedDoseId: string | null;
}

interface UseDoseModalActionsParams {
  openCompleteDoseModal: (draft: CompleteDoseDraft) => void;
}

export const useDoseModalActions = ({ openCompleteDoseModal }: UseDoseModalActionsParams) => {
  const records = useVaccinationStore((state) => state.records);

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
