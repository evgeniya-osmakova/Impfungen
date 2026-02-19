import { useTranslation } from 'react-i18next';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../../../../../constants/ui';
import type { DoseKind } from '../../../../../../interfaces/base';
import type { ImmunizationSeriesView } from '../../../../../../interfaces/immunizationRecord';
import type { AppLanguage } from '../../../../../../interfaces/language';
import { Button } from '../../../../../../ui';
import { formatDateByLanguage } from '../../../../../../utils/date';

import styles from './VaccinationUpcoming.module.css';

interface VaccinationUpcomingProps {
  language: AppLanguage;
  onMarkPlannedDone: (payload: {
    diseaseId: string;
    dueAt: string;
    kind: DoseKind;
    plannedDoseId: string | null;
  }) => void;
  records: readonly ImmunizationSeriesView[];
  resolveDiseaseLabelById: (diseaseId: string) => string;
}

export const VaccinationUpcoming = ({
  language,
  onMarkPlannedDone,
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
            const nextDue = record.nextDue;

            if (!nextDue) {
              return null;
            }

            return (
              <li className={styles.vaccinationUpcoming__item} key={record.diseaseId}>
                <h3 className={styles.vaccinationUpcoming__itemTitle}>
                  {resolveDiseaseLabelById(record.diseaseId)}
                </h3>
                <div className={styles.vaccinationUpcoming__itemActionRow}>
                  <p className={styles.vaccinationUpcoming__itemMeta}>
                    <span>{t('internal.upcomingYear.dueLabel')}</span>
                    <strong>{formatDateByLanguage(nextDue.dueAt, language)}</strong>
                  </p>
                  <Button
                    className={styles.vaccinationUpcoming__actionButton}
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
