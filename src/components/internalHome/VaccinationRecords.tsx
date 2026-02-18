import { useTranslation } from 'react-i18next';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../constants/ui';
import type { AppLanguage } from '../../interfaces/language';
import type { VaccinationRecord } from '../../interfaces/vaccination';
import { Button } from '../../ui';
import { formatDateByLanguage } from '../../utils/date';

import { VaccinationTimeline } from './VaccinationTimeline';

import styles from './VaccinationRecords.module.css';

interface VaccinationRecordsProps {
  language: AppLanguage;
  onDeleteRecord: (diseaseId: string) => void;
  onEditRecord: (diseaseId: string) => void;
  records: readonly VaccinationRecord[];
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
                    onClick={() => onEditRecord(record.diseaseId)}
                    type={HTML_BUTTON_TYPE.button}
                    variant={BUTTON_VARIANT.secondary}
                  >
                    {t('internal.records.actions.edit')}
                  </Button>
                  <Button
                    onClick={() => onDeleteRecord(record.diseaseId)}
                    type={HTML_BUTTON_TYPE.button}
                    variant={BUTTON_VARIANT.danger}
                  >
                    {t('internal.records.actions.delete')}
                  </Button>
                </div>
              </div>
              <p className={styles.vaccinationRecords__completedAt}>
                <span>{t('internal.records.completedLabel')}</span>
                <strong>{formatDateByLanguage(record.completedAt, language)}</strong>
              </p>
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
