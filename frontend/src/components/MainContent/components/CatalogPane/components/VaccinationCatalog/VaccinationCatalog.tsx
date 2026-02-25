import { useTranslation } from 'react-i18next';
import PlusIcon from 'src/assets/icons/plus.svg';

import { INTERNAL_HOME_CATALOG_FIELD_ID } from '../../../../../../constants/internalHomeUi';
import { HTML_BUTTON_TYPE, HTML_INPUT_TYPE } from '../../../../../../constants/ui';
import {
  VACCINATION_CATEGORY_FILTER,
  VACCINATION_CATEGORY_FILTER_OPTIONS,
  VACCINATION_COUNTRY,
} from '../../../../../../constants/vaccination';
import type {
  Category,
  CategoryFilter,
  CountryCode,
} from '../../../../../../interfaces/base';
import type { Disease } from '../../../../../../interfaces/disease';
import { Input, RadioPillGroup } from '../../../../../../ui';

import styles from './VaccinationCatalog.module.css';

interface VaccinationCatalogProps {
  categoryCounts: Record<Category, number>;
  categoryFilter: CategoryFilter;
  country: CountryCode;
  diseases: readonly Disease[];
  onSelectDiseaseFromCatalog: (diseaseId: string) => void;
  onChangeCategoryFilter: (categoryFilter: CategoryFilter) => void;
  onChangeSearchQuery: (searchQuery: string) => void;
  resolveDiseaseLabel: (disease: Disease) => string;
  searchQuery: string;
}

const getFilterCount = (
  filter: CategoryFilter,
  categoryCounts: Record<Category, number>,
): number => {
  if (filter === VACCINATION_CATEGORY_FILTER.all) {
    return categoryCounts.optional + categoryCounts.recommended;
  }

  if (filter === VACCINATION_CATEGORY_FILTER.recommended) {
    return categoryCounts.recommended;
  }

  return categoryCounts.optional;
};

const resolveFilterTextKey = (filter: CategoryFilter): string => {
  if (filter === VACCINATION_CATEGORY_FILTER.all) {
    return 'internal.catalog.filters.all';
  }

  if (filter === VACCINATION_CATEGORY_FILTER.recommended) {
    return 'internal.catalog.filters.recommended';
  }

  return 'internal.catalog.filters.optional';
};

const resolveBadgeTextKey = (category: Category): string => {
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
  onSelectDiseaseFromCatalog,
  onChangeCategoryFilter,
  onChangeSearchQuery,
  resolveDiseaseLabel,
  searchQuery,
}: VaccinationCatalogProps) => {
  const { t } = useTranslation();
  const isUniversalCatalog = country === VACCINATION_COUNTRY.NONE;
  const recommendationCountry = country === VACCINATION_COUNTRY.NONE ? null : country;

  return (
    <section className={styles.vaccinationCatalog}>
      <header className={styles.vaccinationCatalog__header}>
        <h2 className={styles.vaccinationCatalog__title}>{t('internal.catalog.title')}</h2>
        <p className={styles.vaccinationCatalog__description}>
          {isUniversalCatalog
            ? t('internal.catalog.descriptionNoRecommendations')
            : t('internal.catalog.description')}
        </p>
      </header>

      <label
        className={styles.vaccinationCatalog__searchLabel}
        htmlFor={INTERNAL_HOME_CATALOG_FIELD_ID.search}
      >
        {t('internal.catalog.searchLabel')}
      </label>
      <Input
        className={styles.vaccinationCatalog__searchInput}
        id={INTERNAL_HOME_CATALOG_FIELD_ID.search}
        onChange={(event) => onChangeSearchQuery(event.target.value)}
        placeholder={t('internal.catalog.searchPlaceholder')}
        type={HTML_INPUT_TYPE.search}
        value={searchQuery}
      />

      {!isUniversalCatalog && (
        <RadioPillGroup
          controlActiveClassName={styles.vaccinationCatalog__filterActive}
          controlClassName={styles.vaccinationCatalog__filter}
          controlsClassName={styles.vaccinationCatalog__filters}
          legend={t('internal.catalog.countLabel', { count: diseases.length })}
          onChange={onChangeCategoryFilter}
          options={VACCINATION_CATEGORY_FILTER_OPTIONS.map((filter) => ({
            label: (
              <>
                {t(resolveFilterTextKey(filter))}
                <span className={styles.vaccinationCatalog__filterCount}>
                  {getFilterCount(filter, categoryCounts)}
                </span>
              </>
            ),
            value: filter,
          }))}
          unstyled
          value={categoryFilter}
        />
      )}

      <p className={styles.vaccinationCatalog__countLabel}>
        {t('internal.catalog.countLabel', { count: diseases.length })}
      </p>

      {diseases.length > 0 ? (
        <div className={styles.vaccinationCatalog__list}>
          {diseases.map((disease) => {
            const category = recommendationCountry
              ? disease.countryCategory[recommendationCountry]
              : null;

            if (!isUniversalCatalog && !category) {
              return null;
            }

            return (
              <button
                className={styles.vaccinationCatalog__card}
                key={disease.id}
                onClick={() => onSelectDiseaseFromCatalog(disease.id)}
                type={HTML_BUTTON_TYPE.button}
              >
                <div className={styles.vaccinationCatalog__cardHead}>
                  <p className={styles.vaccinationCatalog__cardTitle}>{resolveDiseaseLabel(disease)}</p>
                  <span aria-hidden className={styles.vaccinationCatalog__cardAction}>
                    <PlusIcon className={styles.vaccinationCatalog__cardActionIcon} />
                  </span>
                </div>
                {!isUniversalCatalog && category && (
                  <p className={styles.vaccinationCatalog__cardBadge}>
                    {t(resolveBadgeTextKey(category))}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <p className={styles.vaccinationCatalog__empty}>{t('internal.catalog.empty')}</p>
      )}
    </section>
  );
};
