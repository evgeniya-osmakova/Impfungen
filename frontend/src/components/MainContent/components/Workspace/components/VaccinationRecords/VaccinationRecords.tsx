import type { DoseKind } from '@backend/contracts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { VaccinationRecordCardView } from 'src/interfaces/vaccinationViewData.ts';

import { VaccinationRecordCard } from './VaccinationRecordCard';
import { VaccinationRecordsDeleteModal } from './VaccinationRecordsDeleteModal';

import styles from './VaccinationRecords.module.css';

interface VaccinationRecordsProps {
  onAddDose: (diseaseId: string) => void;
  onDeleteRecord: (diseaseId: string) => Promise<boolean>;
  onEditRecord: (diseaseId: string) => void;
  onMarkPlannedDone: (payload: {
    diseaseId: string;
    dueAt: string;
    kind: DoseKind;
    plannedDoseId: string | null;
  }) => void;
  records: readonly VaccinationRecordCardView[];
  resolveDiseaseLabelById: (diseaseId: string) => string;
}

export const VaccinationRecords = ({
  onAddDose,
  onDeleteRecord,
  onEditRecord,
  onMarkPlannedDone,
  records,
  resolveDiseaseLabelById,
}: VaccinationRecordsProps) => {
  const { t } = useTranslation();
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [deleteRequestError, setDeleteRequestError] = useState<string | null>(null);
  const [expandedHistoryByDiseaseId, setExpandedHistoryByDiseaseId] = useState<
    Record<string, boolean>
  >({});

  const handleCancelDelete = () => {
    setDeleteCandidateId(null);
    setDeleteRequestError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidateId) {
      return;
    }

    setDeleteRequestError(null);

    const isDeleted = await onDeleteRecord(deleteCandidateId);

    if (isDeleted) {
      setDeleteCandidateId(null);

      return;
    }

    setDeleteRequestError(t('internal.records.deleteConfirm.requestFailed'));
  };

  const toggleHistory = (diseaseId: string) => {
    setExpandedHistoryByDiseaseId((prev) => ({
      ...prev,
      [diseaseId]: !prev[diseaseId],
    }));
  };

  return (
    <section className={styles.vaccinationRecords}>
      <header className={styles.vaccinationRecords__header}>
        <h2 className={styles.vaccinationRecords__title}>{t('internal.records.title')}</h2>
      </header>

      {records.length > 0 ? (
        <div className={styles.vaccinationRecords__list}>
          {records.map((record) => (
            <VaccinationRecordCard
              diseaseLabel={resolveDiseaseLabelById(record.diseaseId)}
              isHistoryExpanded={Boolean(expandedHistoryByDiseaseId[record.diseaseId])}
              key={record.diseaseId}
              onAddDose={onAddDose}
              onDeleteRequest={setDeleteCandidateId}
              onEditRecord={onEditRecord}
              onMarkPlannedDone={onMarkPlannedDone}
              onToggleHistory={toggleHistory}
              record={record}
            />
          ))}
        </div>
      ) : (
        <p className={styles.vaccinationRecords__empty}>{t('internal.records.empty')}</p>
      )}

      <VaccinationRecordsDeleteModal
        deleteCandidateId={deleteCandidateId}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        requestError={deleteRequestError}
        resolveDiseaseLabelById={resolveDiseaseLabelById}
      />
    </section>
  );
};
