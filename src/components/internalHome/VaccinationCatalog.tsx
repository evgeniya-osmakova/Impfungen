import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { INTERNAL_HOME_CATALOG_FIELD_ID } from '../../constants/internalHomeUi';
import { HTML_BUTTON_TYPE, HTML_INPUT_TYPE } from '../../constants/ui';
import {
  VACCINATION_CATEGORY_FILTER,
  VACCINATION_CATEGORY_FILTER_OPTIONS,
} from '../../constants/vaccination';
import type {
  VaccinationCategory,
  VaccinationCategoryFilter,
  VaccinationCountryCode,
  VaccinationDisease,
} from '../../interfaces/vaccination';

import styles from './VaccinationCatalog.module.css';

interface VaccinationCatalogProps {
  categoryCounts: Record<VaccinationCategory, number>;
  categoryFilter: VaccinationCategoryFilter;
  country: VaccinationCountryCode;
  diseases: readonly VaccinationDisease[];
  onChangeCategoryFilter: (categoryFilter: VaccinationCategoryFilter) => void;
  onChangeSearchQuery: (searchQuery: string) => void;
  resolveDiseaseLabel: (disease: VaccinationDisease) => string;
  searchQuery: string;
}

const getFilterCount = (
  filter: VaccinationCategoryFilter,
  categoryCounts: Record<VaccinationCategory, number>,
): number => {
  if (filter === VACCINATION_CATEGORY_FILTER.all) {
    return categoryCounts.optional + categoryCounts.recommended;
  }

  if (filter === VACCINATION_CATEGORY_FILTER.recommended) {
    return categoryCounts.recommended;
  }

  return categoryCounts.optional;
};

const resolveFilterTextKey = (filter: VaccinationCategoryFilter): string => {
  if (filter === VACCINATION_CATEGORY_FILTER.all) {
    return 'internal.catalog.filters.all';
  }

  if (filter === VACCINATION_CATEGORY_FILTER.recommended) {
    return 'internal.catalog.filters.recommended';
  }

  return 'internal.catalog.filters.optional';
};

const resolveBadgeTextKey = (category: VaccinationCategory): string => {
  if (category === 'recommended') {
    return 'internal.catalog.badges.recommended';
  }

  return 'internal.catalog.badges.optional';
};

export const VaccinationCatalog = ({
  categoryCounts,
  categoryFilter,
  country,
  diseases,
  onChangeCategoryFilter,
  onChangeSearchQuery,
  resolveDiseaseLabel,
  searchQuery,
}: VaccinationCatalogProps) => {
  const { t } = useTranslation();

  return (
    <section className={styles.vaccinationCatalog}>
      <header className={styles.vaccinationCatalog__header}>
        <h2 className={styles.vaccinationCatalog__title}>{t('internal.catalog.title')}</h2>
        <p className={styles.vaccinationCatalog__description}>{t('internal.catalog.description')}</p>
      </header>

      <label
        className={styles.vaccinationCatalog__searchLabel}
        htmlFor={INTERNAL_HOME_CATALOG_FIELD_ID.search}
      >
        {t('internal.catalog.searchLabel')}
      </label>
      <input
        className={styles.vaccinationCatalog__searchInput}
        id={INTERNAL_HOME_CATALOG_FIELD_ID.search}
        onChange={(event) => onChangeSearchQuery(event.target.value)}
        placeholder={t('internal.catalog.searchPlaceholder')}
        type={HTML_INPUT_TYPE.search}
        value={searchQuery}
      />

      <div
        aria-label={t('internal.catalog.countLabel', { count: diseases.length })}
        className={styles.vaccinationCatalog__filters}
      >
        {VACCINATION_CATEGORY_FILTER_OPTIONS.map((filter) => (
          <button
            className={classNames(
              styles.vaccinationCatalog__filter,
              filter === categoryFilter && styles.vaccinationCatalog__filterActive,
            )}
            key={filter}
            onClick={() => onChangeCategoryFilter(filter)}
            type={HTML_BUTTON_TYPE.button}
          >
            {t(resolveFilterTextKey(filter))}
            <span className={styles.vaccinationCatalog__filterCount}>
              {getFilterCount(filter, categoryCounts)}
            </span>
          </button>
        ))}
      </div>

      <p className={styles.vaccinationCatalog__countLabel}>
        {t('internal.catalog.countLabel', { count: diseases.length })}
      </p>

      {diseases.length > 0 ? (
        <div className={styles.vaccinationCatalog__list}>
          {diseases.map((disease) => {
            const category = disease.countryCategory[country];

            if (!category) {
              return null;
            }

            return (
              <article className={styles.vaccinationCatalog__card} key={disease.id}>
                <p className={styles.vaccinationCatalog__cardTitle}>{resolveDiseaseLabel(disease)}</p>
                <p className={styles.vaccinationCatalog__cardBadge}>
                  {t(resolveBadgeTextKey(category))}
                </p>
              </article>
            );
          })}
        </div>
      ) : (
        <p className={styles.vaccinationCatalog__empty}>{t('internal.catalog.empty')}</p>
      )}
    </section>
  );
};
