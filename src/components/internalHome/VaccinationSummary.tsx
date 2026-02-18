import { useTranslation } from 'react-i18next';

import { VACCINATION_COUNTRY } from '../../constants/vaccination';
import type { VaccinationCountryCode } from '../../interfaces/vaccination';

import styles from './VaccinationSummary.module.css';

interface VaccinationSummaryProps {
  country: VaccinationCountryCode;
  recordsTotal: number;
  withNextDate: number;
}

export const VaccinationSummary = ({ country, recordsTotal, withNextDate }: VaccinationSummaryProps) => {
  const { t } = useTranslation();
  const withoutNextDate = recordsTotal - withNextDate;
  const countryLabel =
    country === VACCINATION_COUNTRY.RU ? t('internal.country.ru') : t('internal.country.de');

  return (
    <section className={styles.vaccinationSummary}>
      <header className={styles.vaccinationSummary__header}>
        <h2 className={styles.vaccinationSummary__title}>{t('internal.summary.title')}</h2>
        <p className={styles.vaccinationSummary__country}>{countryLabel}</p>
      </header>

      <div className={styles.vaccinationSummary__metrics}>
        <article className={styles.vaccinationSummary__metricCard}>
          <p className={styles.vaccinationSummary__metricValue}>{recordsTotal}</p>
          <p className={styles.vaccinationSummary__metricLabel}>{t('internal.summary.recordsTotal')}</p>
        </article>

        <article className={styles.vaccinationSummary__metricCard}>
          <p className={styles.vaccinationSummary__metricValue}>{withNextDate}</p>
          <p className={styles.vaccinationSummary__metricLabel}>{t('internal.summary.withNextDate')}</p>
        </article>

        <article className={styles.vaccinationSummary__metricCard}>
          <p className={styles.vaccinationSummary__metricValue}>{withoutNextDate}</p>
          <p className={styles.vaccinationSummary__metricLabel}>{t('internal.summary.withoutNextDate')}</p>
        </article>
      </div>
    </section>
  );
};
