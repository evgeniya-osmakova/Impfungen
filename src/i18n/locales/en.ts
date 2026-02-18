export const en = {
  translation: {
    language: {
      label: 'Interface language',
      ru: 'Russian',
      de: 'Deutsch',
      en: 'English',
    },
    actions: {
      login: 'Log in',
      logout: 'Log out',
    },
    auth: {
      loading: 'Checking OAuth session...',
      connected: 'You are signed in with OAuth.',
      configHint:
        'Set VITE_OAUTH_AUTHORIZE_URL, VITE_OAUTH_TOKEN_URL, and VITE_OAUTH_CLIENT_ID to enable OAuth login.',
      errors: {
        configMissing: 'OAuth is not configured in environment variables.',
        exchangeFailed: 'OAuth sign-in could not be completed.',
        missingAccessToken: 'OAuth provider did not return an access token.',
        missingVerifier: 'Missing code_verifier for OAuth callback.',
        providerError: 'OAuth provider returned an error.',
        stateMismatch: 'OAuth state validation failed. Try signing in again.',
        unexpected: 'Unexpected OAuth error.',
      },
    },
    hero: {
      badge: 'Vaccination Calendar',
      title: 'Keep every vaccination on schedule',
      description:
        'Track a vaccination calendar, record shots that are already done, and know exactly when the next one is due.',
      features: {
        historyTitle: 'Vaccination history',
        historyDescription:
          'Store completed vaccinations in one personal timeline so your current status is always clear.',
        scheduleTitle: 'Future schedule',
        scheduleDescription:
          'See upcoming vaccinations in advance and stay aligned with recommended dates.',
        remindersTitle: 'Timely reminders',
        remindersDescription:
          'Get clear reminders about the next shot without manually checking deadlines.',
      },
    },
    internal: {
      page: {
        title: 'My vaccinations and upcoming dates',
        description:
          'Add completed vaccinations, enter the next date manually, and browse all still available vaccinations for the selected country.',
      },
      countryOnboarding: {
        title: 'Choose recommendation country',
        description:
          'Country selection controls which vaccinations are marked as recommended or optional in the catalog.',
        hint: 'You can change this selection at any time on this page.',
        confirm: 'Confirm country',
      },
      country: {
        label: 'Recommendation country',
        description: 'Catalog and category labels below are based on the selected country.',
        ru: 'Russia',
        de: 'Germany',
      },
      summary: {
        title: 'Vaccination card summary',
        recordsTotal: 'Total records',
        withNextDate: 'With next date',
        withoutNextDate: 'Without next date',
      },
      form: {
        titleAdd: 'Add completed vaccination',
        titleEdit: 'Edit vaccination record',
        subtitle: 'Next vaccination date is optional and entered manually.',
        noDiseasesForAdd: 'All relevant diseases are already added to your vaccination card.',
        fields: {
          disease: 'Disease',
          diseasePlaceholder: 'Select disease',
          completedAt: 'Completed vaccination date',
          nextDueAt: 'Next vaccination date',
        },
        actions: {
          saveAdd: 'Save record',
          saveEdit: 'Save changes',
          cancelEdit: 'Cancel editing',
        },
        errors: {
          diseaseRequired: 'Choose a disease.',
          completedRequired: 'Provide a valid completed vaccination date.',
          nextBeforeCompleted: 'Next vaccination date cannot be earlier than completed date.',
        },
      },
      records: {
        title: 'Added vaccinations',
        empty: 'No records yet. Add your first vaccination from the form.',
        completedLabel: 'Completed',
        actions: {
          edit: 'Edit',
          delete: 'Delete',
        },
      },
      catalog: {
        title: 'Still available vaccinations',
        description:
          'Only diseases relevant for the selected country and not yet added to your records are shown here.',
        searchLabel: 'Search by disease',
        searchPlaceholder: 'For example: tetanus, measles, hpv',
        countLabel: 'Matching vaccinations: {{count}}',
        empty: 'No diseases match the current filters.',
        filters: {
          all: 'All',
          recommended: 'Recommended',
          optional: 'Optional',
        },
        badges: {
          recommended: 'Recommended',
          optional: 'Optional',
        },
      },
      timeline: {
        title: 'Timeline to next vaccination',
        completed: 'Completed',
        due: 'Next due',
        status: {
          overdue: 'Date already passed',
          today: 'Date is today',
          upcoming: 'Date is upcoming',
        },
      },
      diseases: {
        anthrax: 'Anthrax',
        cholera: 'Cholera',
        covid19: 'COVID-19',
        dengue: 'Dengue',
        diphtheria: 'Diphtheria',
        ebola: 'Ebola',
        haemophilusInfluenzaeTypeB: 'Haemophilus influenzae type B (Hib)',
        hepatitisA: 'Hepatitis A',
        hepatitisB: 'Hepatitis B',
        humanPapillomavirus: 'Human papillomavirus (HPV)',
        influenza: 'Influenza',
        japaneseEncephalitis: 'Japanese encephalitis',
        malaria: 'Malaria',
        measles: 'Measles',
        meningococcalDisease: 'Meningococcal disease',
        mumps: 'Mumps',
        mpox: 'Mpox',
        pertussis: 'Pertussis (whooping cough)',
        pneumococcalDisease: 'Pneumococcal disease',
        poliomyelitis: 'Poliomyelitis',
        rabies: 'Rabies',
        respiratorySyncytialVirus: 'Respiratory syncytial virus (RSV)',
        rotavirus: 'Rotavirus',
        rubella: 'Rubella',
        shingles: 'Shingles (herpes zoster)',
        smallpox: 'Smallpox',
        tetanus: 'Tetanus',
        tickBorneEncephalitis: 'Tick-borne encephalitis',
        tuberculosis: 'Tuberculosis',
        typhoidFever: 'Typhoid fever',
        varicella: 'Varicella (chickenpox)',
        yellowFever: 'Yellow fever',
      },
    },
  },
} as const;
