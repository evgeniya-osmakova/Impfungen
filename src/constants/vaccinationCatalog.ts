import type { VaccinationDisease } from '../interfaces/vaccination';

import { getDiseaseLabelKey } from './internalHomeText';

export const VACCINATION_DISEASE_CATALOG: readonly VaccinationDisease[] = [
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'anthrax',
    labelKey: getDiseaseLabelKey('anthrax'),
    searchAliases: {
      de: ['milzbrand'],
      en: ['anthrax'],
      ru: ['sibirskaya yazva'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'cholera',
    labelKey: getDiseaseLabelKey('cholera'),
    searchAliases: {
      de: ['cholera'],
      en: ['cholera'],
      ru: ['kholera'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'covid19',
    labelKey: getDiseaseLabelKey('covid19'),
    searchAliases: {
      de: ['covid', 'corona'],
      en: ['covid', 'coronavirus'],
      ru: ['covid', 'koronavirus'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'dengue',
    labelKey: getDiseaseLabelKey('dengue'),
    searchAliases: {
      de: ['dengue'],
      en: ['dengue'],
      ru: ['dengue'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'diphtheria',
    labelKey: getDiseaseLabelKey('diphtheria'),
    searchAliases: {
      de: ['diphtherie'],
      en: ['diphtheria'],
      ru: ['difteriya'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'ebola',
    labelKey: getDiseaseLabelKey('ebola'),
    searchAliases: {
      de: ['ebola'],
      en: ['ebola'],
      ru: ['ebola'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'haemophilusInfluenzaeTypeB',
    labelKey: getDiseaseLabelKey('haemophilusInfluenzaeTypeB'),
    searchAliases: {
      de: ['hib', 'haemophilus influenzae b'],
      en: ['hib', 'haemophilus influenzae type b'],
      ru: ['hib', 'gemofilnaya infektsiya b'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'hepatitisA',
    labelKey: getDiseaseLabelKey('hepatitisA'),
    searchAliases: {
      de: ['hepatitis a'],
      en: ['hepatitis a'],
      ru: ['gepatit a'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'hepatitisB',
    labelKey: getDiseaseLabelKey('hepatitisB'),
    searchAliases: {
      de: ['hepatitis b'],
      en: ['hepatitis b'],
      ru: ['gepatit b'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'humanPapillomavirus',
    labelKey: getDiseaseLabelKey('humanPapillomavirus'),
    searchAliases: {
      de: ['hpv', 'papillomavirus'],
      en: ['hpv', 'papillomavirus'],
      ru: ['hpv', 'virus papillomy cheloveka'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'influenza',
    labelKey: getDiseaseLabelKey('influenza'),
    searchAliases: {
      de: ['grippe', 'influenza'],
      en: ['flu', 'influenza'],
      ru: ['gripp', 'influenza'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'japaneseEncephalitis',
    labelKey: getDiseaseLabelKey('japaneseEncephalitis'),
    searchAliases: {
      de: ['japanische enzephalitis'],
      en: ['japanese encephalitis'],
      ru: ['yaponskiy entsefalit'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'malaria',
    labelKey: getDiseaseLabelKey('malaria'),
    searchAliases: {
      de: ['malaria'],
      en: ['malaria'],
      ru: ['malyariya'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'measles',
    labelKey: getDiseaseLabelKey('measles'),
    searchAliases: {
      de: ['masern'],
      en: ['measles'],
      ru: ['kor'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'meningococcalDisease',
    labelKey: getDiseaseLabelKey('meningococcalDisease'),
    searchAliases: {
      de: ['meningokokken'],
      en: ['meningococcal'],
      ru: ['meningokokkovaya infektsiya'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'mumps',
    labelKey: getDiseaseLabelKey('mumps'),
    searchAliases: {
      de: ['mumps'],
      en: ['mumps'],
      ru: ['parotit'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'mpox',
    labelKey: getDiseaseLabelKey('mpox'),
    searchAliases: {
      de: ['mpox', 'affenpocken'],
      en: ['mpox', 'monkeypox'],
      ru: ['mpox', 'ospa obezyan'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'pertussis',
    labelKey: getDiseaseLabelKey('pertussis'),
    searchAliases: {
      de: ['keuchhusten', 'pertussis'],
      en: ['pertussis', 'whooping cough'],
      ru: ['koklyush'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'pneumococcalDisease',
    labelKey: getDiseaseLabelKey('pneumococcalDisease'),
    searchAliases: {
      de: ['pneumokokken'],
      en: ['pneumococcal'],
      ru: ['pnevmokokkovaya infektsiya'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'poliomyelitis',
    labelKey: getDiseaseLabelKey('poliomyelitis'),
    searchAliases: {
      de: ['polio', 'poliomyelitis'],
      en: ['polio', 'poliomyelitis'],
      ru: ['polio', 'poliomielit'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'rabies',
    labelKey: getDiseaseLabelKey('rabies'),
    searchAliases: {
      de: ['tollwut', 'rabies'],
      en: ['rabies'],
      ru: ['beshenstvo'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'optional',
    },
    id: 'respiratorySyncytialVirus',
    labelKey: getDiseaseLabelKey('respiratorySyncytialVirus'),
    searchAliases: {
      de: ['rsv', 'respiratory syncytial virus'],
      en: ['rsv', 'respiratory syncytial virus'],
      ru: ['rsv', 'respiratorno sintitsialny virus'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'optional',
    },
    id: 'rotavirus',
    labelKey: getDiseaseLabelKey('rotavirus'),
    searchAliases: {
      de: ['rotavirus'],
      en: ['rotavirus'],
      ru: ['rotavirus'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'rubella',
    labelKey: getDiseaseLabelKey('rubella'),
    searchAliases: {
      de: ['roeteln', 'rubella'],
      en: ['rubella'],
      ru: ['krasnukha'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'optional',
    },
    id: 'shingles',
    labelKey: getDiseaseLabelKey('shingles'),
    searchAliases: {
      de: ['guertelrose', 'zoster'],
      en: ['shingles', 'zoster'],
      ru: ['opoyasyvayushchiy lishay', 'zoster'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'smallpox',
    labelKey: getDiseaseLabelKey('smallpox'),
    searchAliases: {
      de: ['pocken', 'smallpox'],
      en: ['smallpox'],
      ru: ['naturnalnaya ospa'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'recommended',
    },
    id: 'tetanus',
    labelKey: getDiseaseLabelKey('tetanus'),
    searchAliases: {
      de: ['tetanus', 'wundstarrkrampf'],
      en: ['tetanus'],
      ru: ['stolbnyak'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'tickBorneEncephalitis',
    labelKey: getDiseaseLabelKey('tickBorneEncephalitis'),
    searchAliases: {
      de: ['fsme', 'zeckenenzephalitis'],
      en: ['tbe', 'tick borne encephalitis'],
      ru: ['kleshchevoy entsefalit'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'recommended',
    },
    id: 'tuberculosis',
    labelKey: getDiseaseLabelKey('tuberculosis'),
    searchAliases: {
      de: ['tuberkulose', 'bcg'],
      en: ['tuberculosis', 'bcg'],
      ru: ['tuberkulez', 'bcg'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'typhoidFever',
    labelKey: getDiseaseLabelKey('typhoidFever'),
    searchAliases: {
      de: ['typhus', 'typhoid'],
      en: ['typhoid', 'typhoid fever'],
      ru: ['bryushnoy tif'],
    },
  },
  {
    countryCategory: {
      DE: 'recommended',
      RU: 'optional',
    },
    id: 'varicella',
    labelKey: getDiseaseLabelKey('varicella'),
    searchAliases: {
      de: ['windpocken', 'varizellen'],
      en: ['varicella', 'chickenpox'],
      ru: ['vetryanaya ospa'],
    },
  },
  {
    countryCategory: {
      DE: 'optional',
      RU: 'optional',
    },
    id: 'yellowFever',
    labelKey: getDiseaseLabelKey('yellowFever'),
    searchAliases: {
      de: ['gelbfieber'],
      en: ['yellow fever'],
      ru: ['zheltaya likhoradka'],
    },
  },
] as const;
