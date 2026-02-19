import type { DoseKind } from '../interfaces/base';
import { useInternalHomeUiStore } from '../state/internalHomeUi';
import { useVaccinationApplicationService, useVaccinationStore } from '../state/vaccination';

interface MarkPlannedDonePayload {
  diseaseId: string;
  dueAt: string;
  kind: DoseKind;
  plannedDoseId: string | null;
}

export const useDoseModalActions = () => {
  const records = useVaccinationStore((state) => state.records);
  const service = useVaccinationApplicationService();
  const openCompleteDoseModal = useInternalHomeUiStore((state) => state.openCompleteDoseModal);

  const openAddDoseModal = (diseaseId: string) => {
    openCompleteDoseModal(service.buildAddDoseDraft(records, diseaseId));
  };

  const openMarkPlannedDoneModal = ({
    diseaseId,
    dueAt,
    kind,
    plannedDoseId,
  }: MarkPlannedDonePayload) => {
    openCompleteDoseModal(
      service.buildMarkPlannedDoneDraft(records, {
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
