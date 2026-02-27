import type { DoseKind, RepeatUnit } from '@backend/contracts';
import { useTranslation } from 'react-i18next';
import EditIcon from 'src/assets/icons/edit.svg';
import PlusIcon from 'src/assets/icons/plus.svg';
import TrashIcon from 'src/assets/icons/trash.svg';
import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from 'src/constants/ui';
import { VACCINATION_REPEAT_UNIT } from 'src/constants/vaccination';
import type { VaccinationRecordCardView } from 'src/interfaces/vaccinationViewData.ts';
import { useLanguageStore } from 'src/state/language';
import { Button, SurfacePanel } from 'src/ui';
import { formatDateByLanguage } from 'src/utils/date';

import styles from './VaccinationRecords.module.css';

interface VaccinationRecordCardProps {
  diseaseLabel: string;
  isHistoryExpanded: boolean;
  onAddDose: (diseaseId: string) => void;
  onDeleteRequest: (diseaseId: string) => void;
  onEditRecord: (diseaseId: string) => void;
  onMarkPlannedDone: (payload: {
    diseaseId: string;
    dueAt: string;
    kind: DoseKind;
    plannedDoseId: string | null;
  }) => void;
  onToggleHistory: (diseaseId: string) => void;
  record: VaccinationRecordCardView;
}

export const VaccinationRecordCard = ({
  diseaseLabel,
  isHistoryExpanded,
  onAddDose,
  onDeleteRequest,
  onEditRecord,
  onMarkPlannedDone,
  onToggleHistory,
  record,
}: VaccinationRecordCardProps) => {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);

  const resolveRepeatUnitText = (unit: RepeatUnit, interval: number) =>
    unit === VACCINATION_REPEAT_UNIT.years
      ? t('internal.records.repeatUnits.years', { count: interval })
      : t('internal.records.repeatUnits.months', { count: interval });

  const resolveRepeatPatternText = (interval: number, unit: RepeatUnit) =>
    t('internal.records.repeatPattern', {
      interval,
      unit: resolveRepeatUnitText(unit, interval),
    });

  const resolveDoseKindText = (kind: DoseKind) => t(`internal.doseKind.${kind}`);

  const latestCompletedDose = record.latestCompletedDose;
  const latestCompletedAt = latestCompletedDose?.completedAt ?? null;
  const sortedCompletedDoses = record.completedDoseHistory;
  const historyDoseCount = sortedCompletedDoses.length;
  const shouldShowHistoryToggle = historyDoseCount > 1;
  const visibleCompletedDoses = isHistoryExpanded ? sortedCompletedDoses : [];
  const completedDateLabelKey =
    historyDoseCount > 1
      ? 'internal.records.latestDoseLabel'
      : 'internal.records.vaccinationDateLabel';
  const nextDue = record.nextDue;
  const remainingFutureDueDoses = record.remainingFutureDueDoses;

  return (
    <SurfacePanel as="article" className={styles.vaccinationRecords__card} topAccent>
      <div className={styles.vaccinationRecords__cardHead}>
        <h3 className={styles.vaccinationRecords__cardTitle}>{diseaseLabel}</h3>
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
            onClick={() => onDeleteRequest(record.diseaseId)}
            title={t('internal.records.actions.delete')}
            type={HTML_BUTTON_TYPE.button}
            variant={BUTTON_VARIANT.secondary}
          >
            <TrashIcon aria-hidden="true" className={styles.vaccinationRecords__actionIcon} />
          </Button>
        </div>
      </div>

      {latestCompletedAt ? (
        <div className={styles.vaccinationRecords__status}>
          <div
            className={`${styles.vaccinationRecords__statusGrid} ${!nextDue ? styles.vaccinationRecords__statusGridSingle : ''}`}
          >
            <div className={styles.vaccinationRecords__statusCard}>
              <span className={styles.vaccinationRecords__statusLabel}>
                {t(completedDateLabelKey)}
              </span>
              <strong className={styles.vaccinationRecords__statusDate}>
                {formatDateByLanguage(latestCompletedAt, language)}
              </strong>
            </div>
            {nextDue ? (
              <div className={styles.vaccinationRecords__statusCard}>
                <span className={styles.vaccinationRecords__statusLabel}>
                  {t('internal.records.nextDoseLabel')}
                </span>
                <strong className={styles.vaccinationRecords__statusDate}>
                  {formatDateByLanguage(nextDue.dueAt, language)}
                </strong>
                <Button
                  className={styles.vaccinationRecords__markDoneButton}
                  onClick={() =>
                    onMarkPlannedDone({
                      diseaseId: record.diseaseId,
                      dueAt: nextDue.dueAt,
                      kind: nextDue.kind,
                      plannedDoseId: nextDue.plannedDoseId,
                    })
                  }
                  type={HTML_BUTTON_TYPE.button}
                  variant={BUTTON_VARIANT.secondary}
                >
                  {t('internal.form.actions.markPlannedDone')}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {remainingFutureDueDoses.length > 0 || record.repeatEvery ? (
        <div className={styles.vaccinationRecords__details}>
          {remainingFutureDueDoses.length > 0 ? (
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
          ) : null}
          {record.repeatEvery ? (
            <p className={styles.vaccinationRecords__repeatLine}>
              <span className={styles.vaccinationRecords__repeatLabel}>
                {t('internal.records.repeatEveryLabel')}:
              </span>
              <strong className={styles.vaccinationRecords__repeatValue}>
                {resolveRepeatPatternText(record.repeatEvery.interval, record.repeatEvery.unit)}
              </strong>
            </p>
          ) : null}
        </div>
      ) : null}

      {shouldShowHistoryToggle ? (
        <div className={styles.vaccinationRecords__history}>
          <Button
            className={styles.vaccinationRecords__historyToggle}
            onClick={() => onToggleHistory(record.diseaseId)}
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
          {visibleCompletedDoses.length > 0 ? (
            <ul className={styles.vaccinationRecords__historyList}>
              {visibleCompletedDoses.map((dose) => (
                <li className={styles.vaccinationRecords__historyItem} key={dose.id}>
                  <div className={styles.vaccinationRecords__historyMain}>
                    <strong>{formatDateByLanguage(dose.completedAt, language)}</strong>
                    <span>{resolveDoseKindText(dose.kind)}</span>
                  </div>
                  {dose.tradeName || dose.batchNumber ? (
                    <div className={styles.vaccinationRecords__historyMeta}>
                      {dose.tradeName ? (
                        <span>
                          {t('internal.records.tradeNameLabel')}: {dose.tradeName}
                        </span>
                      ) : null}
                      {dose.batchNumber ? (
                        <span>
                          {t('internal.records.batchNumberLabel')}: {dose.batchNumber}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </SurfacePanel>
  );
};
