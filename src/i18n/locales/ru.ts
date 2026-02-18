export const ru = {
  translation: {
    language: {
      label: 'Язык интерфейса',
      ru: 'Русский',
      de: 'Deutsch',
      en: 'English',
    },
    actions: {
      login: 'Войти',
      logout: 'Выйти',
    },
    auth: {
      loading: 'Проверяем сессию OAuth...',
      connected: 'Вы успешно вошли через OAuth.',
      configHint:
        'Для входа через OAuth задайте VITE_OAUTH_AUTHORIZE_URL, VITE_OAUTH_TOKEN_URL и VITE_OAUTH_CLIENT_ID.',
      errors: {
        configMissing: 'OAuth не настроен в переменных окружения.',
        exchangeFailed: 'Не удалось завершить вход через OAuth.',
        missingAccessToken: 'OAuth-провайдер не вернул access token.',
        missingVerifier: 'Отсутствует code_verifier для завершения OAuth.',
        providerError: 'OAuth-провайдер вернул ошибку.',
        stateMismatch: 'Проверка state не прошла. Повторите вход.',
        unexpected: 'Непредвиденная ошибка OAuth.',
      },
    },
    hero: {
      badge: 'Календарь прививок',
      title: 'Держите прививки под контролем',
      description:
        'Приложение помогает вести календарь прививок: добавляйте уже сделанные прививки и отслеживайте, когда пора делать следующую.',
      features: {
        historyTitle: 'История прививок',
        historyDescription:
          'Сохраняйте все сделанные прививки в личной карте, чтобы быстро видеть полный статус.',
        scheduleTitle: 'План на будущее',
        scheduleDescription:
          'Смотрите, какие прививки предстоят, и не пропускайте рекомендуемые даты.',
        remindersTitle: 'Понятные напоминания',
        remindersDescription:
          'Получайте своевременные сигналы о следующей прививке без лишней рутины.',
      },
    },
    internal: {
      page: {
        title: 'Мои прививки и будущие даты',
        description:
          'Добавляйте сделанные прививки, вручную указывайте следующую дату и просматривайте доступные прививки по выбранной стране.',
      },
      countryOnboarding: {
        title: 'Выберите страну рекомендаций',
        description:
          'Страна определяет, какие прививки считаются рекомендуемыми или опциональными в каталоге.',
        hint: 'Выбор можно изменить в любой момент на этой странице.',
        confirm: 'Подтвердить страну',
      },
      country: {
        label: 'Страна рекомендаций',
        description: 'Каталог и категории ниже рассчитаны для выбранной страны.',
        ru: 'Россия',
        de: 'Германия',
      },
      summary: {
        title: 'Сводка по карте прививок',
        recordsTotal: 'Всего записей',
        withNextDate: 'С датой следующей',
        withoutNextDate: 'Без следующей даты',
      },
      form: {
        titleAdd: 'Добавить сделанную прививку',
        titleEdit: 'Редактировать запись',
        subtitle: 'Следующая дата необязательна и вводится вручную.',
        noDiseasesForAdd: 'Все релевантные заболевания уже добавлены в вашу карту.',
        fields: {
          disease: 'Заболевание',
          diseasePlaceholder: 'Выберите заболевание',
          completedAt: 'Дата сделанной прививки',
          nextDueAt: 'Дата следующей прививки',
        },
        actions: {
          saveAdd: 'Сохранить запись',
          saveEdit: 'Сохранить изменения',
          cancelEdit: 'Отменить редактирование',
        },
        errors: {
          diseaseRequired: 'Выберите заболевание.',
          completedRequired: 'Укажите корректную дату сделанной прививки.',
          nextBeforeCompleted: 'Дата следующей прививки не может быть раньше даты сделанной.',
        },
      },
      records: {
        title: 'Добавленные прививки',
        empty: 'Записей пока нет. Добавьте первую прививку через форму слева.',
        completedLabel: 'Сделана',
        actions: {
          edit: 'Редактировать',
          delete: 'Удалить',
        },
      },
      catalog: {
        title: 'Что ещё можно сделать',
        description:
          'Показаны только заболевания, релевантные выбранной стране, которых ещё нет в вашей карте.',
        searchLabel: 'Поиск по заболеванию',
        searchPlaceholder: 'Например: столбняк, tetanus, hpv',
        countLabel: 'Подходящих прививок: {{count}}',
        empty: 'По текущим фильтрам подходящих заболеваний не найдено.',
        filters: {
          all: 'Все',
          recommended: 'Рекомендуемые',
          optional: 'Опциональные',
        },
        badges: {
          recommended: 'Рекомендуемая',
          optional: 'Опциональная',
        },
      },
      timeline: {
        title: 'Линеечка до следующей прививки',
        completed: 'Сделана',
        due: 'Следующая',
        status: {
          overdue: 'Дата уже прошла',
          today: 'Дата наступила сегодня',
          upcoming: 'Дата впереди',
        },
      },
      diseases: {
        anthrax: 'Сибирская язва',
        cholera: 'Холера',
        covid19: 'COVID-19',
        dengue: 'Денге',
        diphtheria: 'Дифтерия',
        ebola: 'Эбола',
        haemophilusInfluenzaeTypeB: 'Гемофильная инфекция типа B (Hib)',
        hepatitisA: 'Гепатит A',
        hepatitisB: 'Гепатит B',
        humanPapillomavirus: 'Вирус папилломы человека (HPV)',
        influenza: 'Грипп',
        japaneseEncephalitis: 'Японский энцефалит',
        malaria: 'Малярия',
        measles: 'Корь',
        meningococcalDisease: 'Менингококковая инфекция',
        mumps: 'Эпидемический паротит (свинка)',
        mpox: 'Mpox (оспа обезьян)',
        pertussis: 'Коклюш',
        pneumococcalDisease: 'Пневмококковая инфекция',
        poliomyelitis: 'Полиомиелит',
        rabies: 'Бешенство',
        respiratorySyncytialVirus: 'Респираторно-синцитиальный вирус (RSV)',
        rotavirus: 'Ротавирусная инфекция',
        rubella: 'Краснуха',
        shingles: 'Опоясывающий лишай (Herpes zoster)',
        smallpox: 'Натуральная оспа',
        tetanus: 'Столбняк',
        tickBorneEncephalitis: 'Клещевой энцефалит',
        tuberculosis: 'Туберкулез',
        typhoidFever: 'Брюшной тиф',
        varicella: 'Ветряная оспа',
        yellowFever: 'Желтая лихорадка',
      },
    },
  },
} as const;
