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
  },
} as const;
