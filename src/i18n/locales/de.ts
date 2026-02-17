export const de = {
  translation: {
    language: {
      label: 'Sprache',
      ru: 'Russisch',
      de: 'Deutsch',
      en: 'Englisch',
    },
    actions: {
      login: 'Anmelden',
      logout: 'Abmelden',
    },
    auth: {
      loading: 'OAuth-Sitzung wird geprueft...',
      connected: 'Du bist ueber OAuth angemeldet.',
      configHint:
        'Setze VITE_OAUTH_AUTHORIZE_URL, VITE_OAUTH_TOKEN_URL und VITE_OAUTH_CLIENT_ID, um OAuth-Login zu aktivieren.',
      errors: {
        configMissing: 'OAuth ist in den Umgebungsvariablen nicht konfiguriert.',
        exchangeFailed: 'OAuth-Anmeldung konnte nicht abgeschlossen werden.',
        missingAccessToken: 'Der OAuth-Provider hat kein Access Token geliefert.',
        missingVerifier: 'code_verifier fuer den OAuth-Callback fehlt.',
        providerError: 'Der OAuth-Provider hat einen Fehler zurueckgegeben.',
        stateMismatch: 'OAuth-State-Pruefung fehlgeschlagen. Bitte erneut anmelden.',
        unexpected: 'Unerwarteter OAuth-Fehler.',
      },
    },
    hero: {
      badge: 'Impfkalender',
      title: 'Behalte alle Impfungen im Blick',
      description:
        'Verwalte deinen Impfkalender, trage bereits gemachte Impfungen ein und sieh rechtzeitig, wann die naechste faellig ist.',
      features: {
        historyTitle: 'Impfverlauf',
        historyDescription:
          'Speichere erledigte Impfungen an einem Ort, damit dein aktueller Status sofort sichtbar ist.',
        scheduleTitle: 'Naechste Termine',
        scheduleDescription:
          'Sieh kommende Impfungen fruehzeitig und halte empfohlene Zeitpunkte einfacher ein.',
        remindersTitle: 'Klare Erinnerungen',
        remindersDescription:
          'Erhalte rechtzeitig Hinweise auf die naechste Impfung, ohne selbst Fristen zu verfolgen.',
      },
    },
    internal: {
      placeholderTitle: 'Bereich in Arbeit',
      placeholderDescription:
        'Dieser Bereich wird als naechstes mit Funktionen gefuellt. Header und Footer stehen bereits als gemeinsames Layout.',
    },
  },
} as const;
