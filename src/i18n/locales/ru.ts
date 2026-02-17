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
      placeholderTitle: 'Раздел в разработке',
      placeholderDescription:
        'Эта часть приложения будет заполняться новым функционалом. Хедер и футер уже готовы как общий каркас.',
    },
  },
} as const;
