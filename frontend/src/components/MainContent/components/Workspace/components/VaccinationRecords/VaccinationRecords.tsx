import type { DoseKind } from '@backend/contracts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { VaccinationRecordCardView } from 'src/interfaces/vaccinationViewData.ts';
import { useLanguageStore } from 'src/state/language';
import { formatDateByLanguage } from 'src/utils/date';

import { VaccinationRecordCard } from './VaccinationRecordCard';
import { VaccinationRecordsDeleteModal } from './VaccinationRecordsDeleteModal';

import styles from './VaccinationRecords.module.css';

interface VaccinationRecordsProps {
  onAddDose: (diseaseId: string) => void;
  onDeleteDose: (payload: { diseaseId: string; doseId: string }) => Promise<boolean>;
  onDeleteRecord: (diseaseId: string) => Promise<boolean>;
  onEditDose: (diseaseId: string, doseId: string) => void;
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
  onDeleteDose,
  onDeleteRecord,
  onEditDose,
  onEditRecord,
  onMarkPlannedDone,
  records,
  resolveDiseaseLabelById,
}: VaccinationRecordsProps) => {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const [deleteRecordCandidateId, setDeleteRecordCandidateId] = useState<string | null>(null);
  const [deleteRecordRequestError, setDeleteRecordRequestError] = useState<string | null>(null);
  const [deleteDoseCandidate, setDeleteDoseCandidate] = useState<{
    completedAt: string;
    diseaseId: string;
    doseId: string;
  } | null>(null);
  const [deleteDoseRequestError, setDeleteDoseRequestError] = useState<string | null>(null);
  const [expandedHistoryByDiseaseId, setExpandedHistoryByDiseaseId] = useState<
    Record<string, boolean>
  >({});

  const handleCancelRecordDelete = () => {
    setDeleteRecordCandidateId(null);
    setDeleteRecordRequestError(null);
  };

  const handleConfirmRecordDelete = async () => {
    if (!deleteRecordCandidateId) {
      return;
    }

    setDeleteRecordRequestError(null);

    const isDeleted = await onDeleteRecord(deleteRecordCandidateId);

    if (isDeleted) {
      setDeleteRecordCandidateId(null);

      return;
    }

    setDeleteRecordRequestError(t('internal.records.deleteConfirm.requestFailed'));
  };

  const handleCancelDoseDelete = () => {
    setDeleteDoseCandidate(null);
    setDeleteDoseRequestError(null);
  };

  const handleConfirmDoseDelete = async () => {
    if (!deleteDoseCandidate) {
      return;
    }

    setDeleteDoseRequestError(null);

    const isDeleted = await onDeleteDose({
      diseaseId: deleteDoseCandidate.diseaseId,
      doseId: deleteDoseCandidate.doseId,
    });

    if (isDeleted) {
      setDeleteDoseCandidate(null);

      return;
    }

    setDeleteDoseRequestError(t('internal.records.deleteDoseConfirm.requestFailed'));
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
              onDeleteDoseRequest={setDeleteDoseCandidate}
              onDeleteRecordRequest={setDeleteRecordCandidateId}
              onEditDose={onEditDose}
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
        confirmLabel={t('internal.records.deleteConfirm.confirm')}
        isOpen={Boolean(deleteRecordCandidateId)}
        message={t('internal.records.deleteConfirm.message', {
          disease: deleteRecordCandidateId ? resolveDiseaseLabelById(deleteRecordCandidateId) : '',
        })}
        onCancel={handleCancelRecordDelete}
        onConfirm={handleConfirmRecordDelete}
        requestError={deleteRecordRequestError}
        title={t('internal.records.deleteConfirm.title')}
        warning={t('internal.records.deleteConfirm.warning')}
      />
      <VaccinationRecordsDeleteModal
        confirmLabel={t('internal.records.deleteDoseConfirm.confirm')}
        isOpen={Boolean(deleteDoseCandidate)}
        message={t('internal.records.deleteDoseConfirm.message', {
          date: deleteDoseCandidate
            ? formatDateByLanguage(deleteDoseCandidate.completedAt, language)
            : '',
          disease: deleteDoseCandidate
            ? resolveDiseaseLabelById(deleteDoseCandidate.diseaseId)
            : '',
        })}
        onCancel={handleCancelDoseDelete}
        onConfirm={handleConfirmDoseDelete}
        requestError={deleteDoseRequestError}
        title={t('internal.records.deleteDoseConfirm.title')}
        warning={t('internal.records.deleteDoseConfirm.warning')}
      />
    </section>
  );
};
