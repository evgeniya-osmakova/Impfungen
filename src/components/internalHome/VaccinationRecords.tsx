import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import EditIcon from 'src/assets/icons/edit.svg';
import PlusIcon from 'src/assets/icons/plus.svg';
import TrashIcon from 'src/assets/icons/trash.svg';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../constants/ui';
import { VACCINATION_REPEAT_UNIT } from '../../constants/vaccination';
import type { AppLanguage } from '../../interfaces/language';
import {
  VACCINATION_NEXT_DUE_SOURCE,
  type VaccinationCompletedDose,
  type VaccinationDoseKind,
  type VaccinationRecordView,
  type VaccinationRepeatUnit,
} from '../../interfaces/vaccination';
import { Button, Modal } from '../../ui';
import { formatDateByLanguage } from '../../utils/date';

import styles from './VaccinationRecords.module.css';

interface VaccinationRecordsProps {
  language: AppLanguage;
  onAddDose: (diseaseId: string) => void;
  onDeleteRecord: (diseaseId: string) => void;
  onEditRecord: (diseaseId: string) => void;
  onMarkPlannedDone: (payload: {
    diseaseId: string;
    dueAt: string;
    kind: VaccinationDoseKind;
    plannedDoseId: string | null;
  }) => void;
  records: readonly VaccinationRecordView[];
  resolveDiseaseLabelById: (diseaseId: string) => string;
}

const resolveLatestCompletedDose = (
  record: VaccinationRecordView,
): VaccinationCompletedDose | null => {
  if (record.completedDoses.length === 0) {
    return null;
  }

  return [...record.completedDoses].sort((leftDose, rightDose) =>
    leftDose.completedAt.localeCompare(rightDose.completedAt),
  )[record.completedDoses.length - 1] ?? null;
};

const resolveRemainingFutureDueDoses = (
  record: VaccinationRecordView,
  nextDue: VaccinationRecordView['nextDue'],
) => {
  if (!nextDue || nextDue.source !== VACCINATION_NEXT_DUE_SOURCE.manual) {
    return record.futureDueDoses;
  }

  if (nextDue.plannedDoseId) {
    return record.futureDueDoses.filter((dose) => dose.id !== nextDue.plannedDoseId);
  }

  return record.futureDueDoses.filter((dose) => dose.dueAt !== nextDue.dueAt);
};

export const VaccinationRecords = ({
  language,
  onAddDose,
  onDeleteRecord,
  onEditRecord,
  onMarkPlannedDone,
  records,
  resolveDiseaseLabelById,
}: VaccinationRecordsProps) => {
  const { t } = useTranslation();
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [expandedHistoryByDiseaseId, setExpandedHistoryByDiseaseId] = useState<Record<string, boolean>>({});

  const resolveRepeatUnitText = (unit: VaccinationRepeatUnit, interval: number) =>
    unit === VACCINATION_REPEAT_UNIT.years
      ? t('internal.records.repeatUnits.years', { count: interval })
      : t('internal.records.repeatUnits.months', { count: interval });

  const resolveRepeatPatternText = (interval: number, unit: VaccinationRepeatUnit) =>
    t('internal.records.repeatPattern', {
      interval,
      unit: resolveRepeatUnitText(unit, interval),
    });

  const resolveDoseKindText = (kind: VaccinationDoseKind) => t(`internal.doseKind.${kind}`);
  const deleteCandidateDiseaseLabel = deleteCandidateId ? resolveDiseaseLabelById(deleteCandidateId) : null;

  const handleCancelDelete = () => {
    setDeleteCandidateId(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidateId) {
      return;
    }

    onDeleteRecord(deleteCandidateId);
    setDeleteCandidateId(null);
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
          {records.map((record) => {
            const diseaseLabel = resolveDiseaseLabelById(record.diseaseId);
            const latestCompletedDose = resolveLatestCompletedDose(record);
            const latestCompletedAt = latestCompletedDose?.completedAt ?? null;
            const sortedCompletedDoses = [...record.completedDoses].sort((leftDose, rightDose) =>
              rightDose.completedAt.localeCompare(leftDose.completedAt),
            );
            const isHistoryExpanded = Boolean(expandedHistoryByDiseaseId[record.diseaseId]);
            const historyDoseCount = sortedCompletedDoses.length;
            const shouldShowHistoryToggle = historyDoseCount > 1;
            const visibleCompletedDoses = isHistoryExpanded
              ? sortedCompletedDoses
              : [];
            const completedDateLabelKey = historyDoseCount > 1
              ? 'internal.records.latestDoseLabel'
              : 'internal.records.vaccinationDateLabel';
            const nextDue = record.nextDue;
            const remainingFutureDueDoses = resolveRemainingFutureDueDoses(record, nextDue);

            return (
              <article className={styles.vaccinationRecords__card} key={record.diseaseId}>
                <div className={styles.vaccinationRecords__cardHead}>
                  <h3 className={styles.vaccinationRecords__cardTitle}>
                    {diseaseLabel}
                  </h3>
                  <div className={styles.vaccinationRecords__actions}>
                    <Button
                      aria-label={t('internal.form.actions.addDose')}
                      className={`${styles.vaccinationRecords__actionButton} ${styles.vaccinationRecords__actionButtonIcon}`}
                      onClick={() => onAddDose(record.diseaseId)}
                      title={t('internal.form.actions.addDose')}
                      type={HTML_BUTTON_TYPE.button}
                      variant={BUTTON_VARIANT.secondary}
                    >
                      <PlusIcon aria-hidden="true" className={styles.vaccinationRecords__actionIcon} />
                    </Button>
                    <Button
                      aria-label={t('internal.records.actions.edit')}
                      className={`${styles.vaccinationRecords__actionButton} ${styles.vaccinationRecords__actionButtonIcon}`}
                      onClick={() => onEditRecord(record.diseaseId)}
                      title={t('internal.records.actions.edit')}
                      type={HTML_BUTTON_TYPE.button}
                      variant={BUTTON_VARIANT.secondary}
                    >
                      <EditIcon aria-hidden="true" className={styles.vaccinationRecords__actionIcon} />
                    </Button>
                    <Button
                      aria-label={t('internal.records.actions.delete')}
                      className={`${styles.vaccinationRecords__actionButton} ${styles.vaccinationRecords__actionButtonIcon} ${styles.vaccinationRecords__actionButtonDelete}`}
                      onClick={() => setDeleteCandidateId(record.diseaseId)}
                      title={t('internal.records.actions.delete')}
                      type={HTML_BUTTON_TYPE.button}
                      variant={BUTTON_VARIANT.secondary}
                    >
                      <TrashIcon aria-hidden="true" className={styles.vaccinationRecords__actionIcon} />
                    </Button>
                  </div>
                </div>

                {nextDue && latestCompletedAt && (
                  <div className={styles.vaccinationRecords__status}>
                    <div className={styles.vaccinationRecords__statusGrid}>
                      <div className={styles.vaccinationRecords__statusCard}>
                        <span className={styles.vaccinationRecords__statusLabel}>
                          {t(completedDateLabelKey)}
                        </span>
                        <strong className={styles.vaccinationRecords__statusDate}>
                          {formatDateByLanguage(latestCompletedAt, language)}
                        </strong>
                      </div>
                      <div className={styles.vaccinationRecords__statusCard}>
                        <span className={styles.vaccinationRecords__statusLabel}>
                          {t('internal.records.nextDoseLabel')}
                        </span>
                        <strong className={styles.vaccinationRecords__statusDate}>
                          {formatDateByLanguage(nextDue.dueAt, language)}
                        </strong>
                        <Button
                          className={styles.vaccinationRecords__markDoneButton}
                          onClick={() => onMarkPlannedDone({
                            diseaseId: record.diseaseId,
                            dueAt: nextDue.dueAt,
                            kind: nextDue.kind,
                            plannedDoseId: nextDue.plannedDoseId,
                          })}
                          type={HTML_BUTTON_TYPE.button}
                          variant={BUTTON_VARIANT.secondary}
                        >
                          {t('internal.form.actions.markPlannedDone')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {(remainingFutureDueDoses.length > 0 || record.repeatEvery) && (
                  <div className={styles.vaccinationRecords__details}>
                    {remainingFutureDueDoses.length > 0 && (
                      <div className={styles.vaccinationRecords__futureDates}>
                        <span className={styles.vaccinationRecords__futureDatesLabel}>
                          {t('internal.records.futureDatesLabel')}:
                        </span>
                        <ul className={styles.vaccinationRecords__futureDatesList}>
                          {remainingFutureDueDoses.map((futureDose) => (
                            <li className={styles.vaccinationRecords__futureDatesItem} key={futureDose.id}>
                              {formatDateByLanguage(futureDose.dueAt, language)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {record.repeatEvery && (
                      <p className={styles.vaccinationRecords__repeatLine}>
                        <span className={styles.vaccinationRecords__repeatLabel}>
                          {t('internal.records.repeatEveryLabel')}:
                        </span>
                        <strong className={styles.vaccinationRecords__repeatValue}>
                          {resolveRepeatPatternText(record.repeatEvery.interval, record.repeatEvery.unit)}
                        </strong>
                      </p>
                    )}
                  </div>
                )}

                {shouldShowHistoryToggle && (
                  <div className={styles.vaccinationRecords__history}>
                    <Button
                      className={styles.vaccinationRecords__historyToggle}
                      onClick={() => toggleHistory(record.diseaseId)}
                      aria-expanded={isHistoryExpanded}
                      type={HTML_BUTTON_TYPE.button}
                      variant={BUTTON_VARIANT.secondary}
                    >
                      <span
                        aria-hidden="true"
                        className={`${styles.vaccinationRecords__historyToggleIcon} ${
                          isHistoryExpanded ? styles.vaccinationRecords__historyToggleIconExpanded : ''
                        }`}
                      />
                      <span className={styles.vaccinationRecords__historyToggleText}>
                        {isHistoryExpanded
                          ? t('internal.records.history.hide', { count: historyDoseCount })
                          : t('internal.records.history.show', { count: historyDoseCount })}
                      </span>
                    </Button>
                    {visibleCompletedDoses.length > 0 && (
                      <ul className={styles.vaccinationRecords__historyList}>
                        {visibleCompletedDoses.map((dose) => (
                          <li className={styles.vaccinationRecords__historyItem} key={dose.id}>
                            <div className={styles.vaccinationRecords__historyMain}>
                              <strong>{formatDateByLanguage(dose.completedAt, language)}</strong>
                              <span>{resolveDoseKindText(dose.kind)}</span>
                            </div>
                            {(dose.tradeName || dose.batchNumber) && (
                              <div className={styles.vaccinationRecords__historyMeta}>
                                {dose.tradeName && (
                                  <span>
                                    {t('internal.records.tradeNameLabel')}: {dose.tradeName}
                                  </span>
                                )}
                                {dose.batchNumber && (
                                  <span>
                                    {t('internal.records.batchNumberLabel')}: {dose.batchNumber}
                                  </span>
                                )}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <p className={styles.vaccinationRecords__empty}>{t('internal.records.empty')}</p>
      )}
      <Modal
        ariaLabel={t('internal.records.deleteConfirm.title')}
        closeAriaLabel={t('internal.form.actions.closeModal')}
        isOpen={Boolean(deleteCandidateId)}
        onClose={handleCancelDelete}
      >
        <section className={styles.vaccinationRecords__deleteModal}>
          <h3 className={styles.vaccinationRecords__deleteModalTitle}>
            {t('internal.records.deleteConfirm.title')}
          </h3>
          <p className={styles.vaccinationRecords__deleteModalText}>
            {t('internal.records.deleteConfirm.message', { disease: deleteCandidateDiseaseLabel ?? '' })}
          </p>
          <p className={styles.vaccinationRecords__deleteModalWarning}>
            {t('internal.records.deleteConfirm.warning')}
          </p>
          <div className={styles.vaccinationRecords__deleteModalActions}>
            <Button
              className={styles.vaccinationRecords__deleteModalButton}
              onClick={handleCancelDelete}
              type={HTML_BUTTON_TYPE.button}
              variant={BUTTON_VARIANT.secondary}
            >
              {t('internal.records.deleteConfirm.cancel')}
            </Button>
            <Button
              className={styles.vaccinationRecords__deleteModalButton}
              onClick={handleConfirmDelete}
              type={HTML_BUTTON_TYPE.button}
              variant={BUTTON_VARIANT.danger}
            >
              {t('internal.records.deleteConfirm.confirm')}
            </Button>
          </div>
        </section>
      </Modal>
    </section>
  );
};
