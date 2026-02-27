import type { DoseKind } from '@backend/contracts';
import type { CompleteDoseDraft } from 'src/interfaces/completeDoseDraft';
import { useVaccinationStore } from 'src/state/vaccination';
import {
  buildAddDoseDraft,
  buildMarkPlannedDoneDraft,
} from 'src/state/vaccination/completeDoseDraft.ts';

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
