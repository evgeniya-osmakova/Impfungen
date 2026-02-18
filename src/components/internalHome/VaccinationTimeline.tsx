import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { VACCINATION_TIMELINE_STATUS } from '../../constants/vaccination';
import type { AppLanguage } from '../../interfaces/language';
import { formatDateByLanguage } from '../../utils/date';
import { resolveVaccinationTimeline } from '../../utils/timeline';

import styles from './VaccinationTimeline.module.css';

const railStatusClassNameByType = {
  [VACCINATION_TIMELINE_STATUS.overdue]: styles.vaccinationTimeline__railOverdue,
  [VACCINATION_TIMELINE_STATUS.today]: styles.vaccinationTimeline__railToday,
  [VACCINATION_TIMELINE_STATUS.upcoming]: styles.vaccinationTimeline__railUpcoming,
};

interface VaccinationTimelineProps {
  completedAt: string;
  language: AppLanguage;
  nextDueAt: string;
}

export const VaccinationTimeline = ({
  completedAt,
  language,
  nextDueAt,
}: VaccinationTimelineProps) => {
  const { t } = useTranslation();
  const timelineMeta = resolveVaccinationTimeline(nextDueAt);

  if (!timelineMeta) {
    return null;
  }

  return (
    <section className={styles.vaccinationTimeline}>
      <div
        className={classNames(
          styles.vaccinationTimeline__rail,
          railStatusClassNameByType[timelineMeta.status],
        )}
      >
        <span className={styles.vaccinationTimeline__dotStart} />
        <span className={styles.vaccinationTimeline__dotEnd} />
      </div>
      <div className={styles.vaccinationTimeline__meta}>
        <p className={styles.vaccinationTimeline__line}>
          <span className={styles.vaccinationTimeline__label}>{t('internal.timeline.completed')}</span>
          <span>{formatDateByLanguage(completedAt, language)}</span>
        </p>
        <p className={styles.vaccinationTimeline__line}>
          <span className={styles.vaccinationTimeline__label}>{t('internal.timeline.due')}</span>
          <span>{formatDateByLanguage(nextDueAt, language)}</span>
        </p>
      </div>
    </section>
  );
};
