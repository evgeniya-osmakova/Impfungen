import { useTranslation } from 'react-i18next';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../constants/ui';
import { VACCINATION_REPEAT_UNIT } from '../../constants/vaccination';
import type { AppLanguage } from '../../interfaces/language';
import type { VaccinationRepeatUnit } from '../../interfaces/vaccination';
import type { VaccinationRecordView } from '../../interfaces/vaccination';
import { Button } from '../../ui';
import { formatDateByLanguage } from '../../utils/date';

import { VaccinationTimeline } from './VaccinationTimeline';

import styles from './VaccinationRecords.module.css';

interface VaccinationRecordsProps {
  language: AppLanguage;
  onDeleteRecord: (diseaseId: string) => void;
  onEditRecord: (diseaseId: string) => void;
  records: readonly VaccinationRecordView[];
  resolveDiseaseLabelById: (diseaseId: string) => string;
}

export const VaccinationRecords = ({
  language,
  onDeleteRecord,
  onEditRecord,
  records,
  resolveDiseaseLabelById,
}: VaccinationRecordsProps) => {
  const { t } = useTranslation();

  const resolveRepeatUnitText = (unit: VaccinationRepeatUnit, interval: number) =>
    unit === VACCINATION_REPEAT_UNIT.years
      ? t('internal.records.repeatUnits.years', { count: interval })
      : t('internal.records.repeatUnits.months', { count: interval });

  const resolveRepeatPatternText = (interval: number, unit: VaccinationRepeatUnit) =>
    t('internal.records.repeatPattern', {
      interval,
      unit: resolveRepeatUnitText(unit, interval),
    });

  return (
    <section className={styles.vaccinationRecords}>
      <header className={styles.vaccinationRecords__header}>
        <h2 className={styles.vaccinationRecords__title}>{t('internal.records.title')}</h2>
      </header>

      {records.length > 0 ? (
        <div className={styles.vaccinationRecords__list}>
          {records.map((record) => (
            <article className={styles.vaccinationRecords__card} key={record.diseaseId}>
              <div className={styles.vaccinationRecords__cardHead}>
                <h3 className={styles.vaccinationRecords__cardTitle}>
                  {resolveDiseaseLabelById(record.diseaseId)}
                </h3>
                <div className={styles.vaccinationRecords__actions}>
                  <Button
                    className={styles.vaccinationRecords__actionButton}
                    onClick={() => onEditRecord(record.diseaseId)}
                    type={HTML_BUTTON_TYPE.button}
                    variant={BUTTON_VARIANT.secondary}
                  >
                    {t('internal.records.actions.edit')}
                  </Button>
                  <Button
                    className={`${styles.vaccinationRecords__actionButton} ${styles.vaccinationRecords__actionButtonDelete}`}
                    onClick={() => onDeleteRecord(record.diseaseId)}
                    type={HTML_BUTTON_TYPE.button}
                    variant={BUTTON_VARIANT.secondary}
                  >
                    {t('internal.records.actions.delete')}
                  </Button>
                </div>
              </div>
              <p className={styles.vaccinationRecords__completedAt}>
                <span>{t('internal.records.completedLabel')}</span>
                <strong>{formatDateByLanguage(record.completedAt, language)}</strong>
              </p>
              {(record.tradeName || record.batchNumber || record.futureDueDates.length > 0 || record.repeatEvery) && (
                <div className={styles.vaccinationRecords__details}>
                  {record.tradeName && (
                    <p className={styles.vaccinationRecords__detailLine}>
                      <span>{t('internal.records.tradeNameLabel')}</span>
                      <strong>{record.tradeName}</strong>
                    </p>
                  )}
                  {record.batchNumber && (
                    <p className={styles.vaccinationRecords__detailLine}>
                      <span>{t('internal.records.batchNumberLabel')}</span>
                      <strong>{record.batchNumber}</strong>
                    </p>
                  )}
                  {record.futureDueDates.length > 0 && (
                    <p className={styles.vaccinationRecords__detailLine}>
                      <span>{t('internal.records.futureDatesLabel')}</span>
                      <strong>
                        {record.futureDueDates
                          .map((futureDate) => formatDateByLanguage(futureDate, language))
                          .join(', ')}
                      </strong>
                    </p>
                  )}
                  {record.repeatEvery && (
                    <p className={styles.vaccinationRecords__detailLine}>
                      <span>{t('internal.records.repeatEveryLabel')}</span>
                      <strong>
                        {resolveRepeatPatternText(
                          record.repeatEvery.interval,
                          record.repeatEvery.unit,
                        )}
                      </strong>
                    </p>
                  )}
                </div>
              )}
              {record.nextDueAt && (
                <VaccinationTimeline
                  completedAt={record.completedAt}
                  language={language}
                  nextDueAt={record.nextDueAt}
                />
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.vaccinationRecords__empty}>{t('internal.records.empty')}</p>
      )}
    </section>
  );
};
