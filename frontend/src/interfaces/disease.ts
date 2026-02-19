import type { Category, RecommendationCountryCode } from './base';
import type { AppLanguage } from './language';

export interface Disease {
  countryCategory: Record<RecommendationCountryCode, Category | null>;
  id: string;
  labelKey: string;
  searchAliases: Record<AppLanguage, readonly string[]>;
}
