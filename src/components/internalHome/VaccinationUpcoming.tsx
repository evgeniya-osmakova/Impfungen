import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../interfaces/language';
import type { VaccinationRecordView } from '../../interfaces/vaccination';
import { formatDateByLanguage } from '../../utils/date';

import styles from './VaccinationUpcoming.module.css';

interface VaccinationUpcomingProps {
  language: AppLanguage;
  records: readonly VaccinationRecordView[];
  resolveDiseaseLabelById: (diseaseId: string) => string;
}

export const VaccinationUpcoming = ({
  language,
  records,
  resolveDiseaseLabelById,
}: VaccinationUpcomingProps) => {
  const { t } = useTranslation();

  return (
    <section className={styles.vaccinationUpcoming}>
      <header className={styles.vaccinationUpcoming__header}>
        <h2 className={styles.vaccinationUpcoming__title}>{t('internal.upcomingYear.title')}</h2>
        <p className={styles.vaccinationUpcoming__description}>
          {t('internal.upcomingYear.description')}
        </p>
      </header>
      {records.length > 0 ? (
        <ul className={styles.vaccinationUpcoming__list}>
          {records.map((record) => {
            if (!record.nextDueAt) {
              return null;
            }

            return (
              <li className={styles.vaccinationUpcoming__item} key={record.diseaseId}>
                <h3 className={styles.vaccinationUpcoming__itemTitle}>
                  {resolveDiseaseLabelById(record.diseaseId)}
                </h3>
                <p className={styles.vaccinationUpcoming__itemMeta}>
                  <span>{t('internal.upcomingYear.dueLabel')}</span>
                  <strong>{formatDateByLanguage(record.nextDueAt, language)}</strong>
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.vaccinationUpcoming__empty}>{t('internal.upcomingYear.empty')}</p>
      )}
    </section>
  );
};
