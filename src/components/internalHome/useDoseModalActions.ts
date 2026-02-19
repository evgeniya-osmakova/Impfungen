import { VACCINATION_DOSE_KIND } from '../../constants/vaccination';
import type { VaccinationDoseKind, VaccinationRecord } from '../../interfaces/vaccination';
import { useInternalHomeUiStore } from '../../store/internalHomeUiStore';
import { useVaccinationStore } from '../../store/vaccinationStore';

interface MarkPlannedDonePayload {
  diseaseId: string;
  dueAt: string;
  kind: VaccinationDoseKind;
  plannedDoseId: string | null;
}

const resolveLatestCompletedDoseByDiseaseId = (
  records: readonly VaccinationRecord[],
  diseaseId: string,
) => {
  const targetRecord = records.find((record) => record.diseaseId === diseaseId);

  if (!targetRecord || targetRecord.completedDoses.length === 0) {
    return null;
  }

  return [...targetRecord.completedDoses].sort((leftDose, rightDose) =>
    rightDose.completedAt.localeCompare(leftDose.completedAt),
  )[0] ?? null;
};

export const useDoseModalActions = () => {
  const { records } = useVaccinationStore();
  const { openCompleteDoseModal } = useInternalHomeUiStore();

  const openAddDoseModal = (diseaseId: string) => {
    const latestCompletedDose = resolveLatestCompletedDoseByDiseaseId(records, diseaseId);

    openCompleteDoseModal({
      diseaseId,
      initialValues: {
        batchNumber: latestCompletedDose?.batchNumber ?? null,
        completedAt: '',
        kind: latestCompletedDose?.kind ?? VACCINATION_DOSE_KIND.nextDose,
        plannedDoseId: null,
        tradeName: latestCompletedDose?.tradeName ?? null,
      },
      isMarkPlannedFlow: false,
    });
  };

  const openMarkPlannedDoneModal = ({
    diseaseId,
    dueAt,
    kind,
    plannedDoseId,
  }: MarkPlannedDonePayload) => {
    const latestCompletedDose = resolveLatestCompletedDoseByDiseaseId(records, diseaseId);

    openCompleteDoseModal({
      diseaseId,
      initialValues: {
        batchNumber: latestCompletedDose?.batchNumber ?? null,
        completedAt: dueAt,
        kind,
        plannedDoseId,
        tradeName: latestCompletedDose?.tradeName ?? null,
      },
      isMarkPlannedFlow: true,
    });
  };

  return {
    openAddDoseModal,
    openMarkPlannedDoneModal,
  };
};
