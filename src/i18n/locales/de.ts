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
      page: {
        title: 'Meine Impfungen und kommende Termine',
        description:
          'Erfasse erledigte Impfungen, trage das naechste Datum manuell ein und sehe alle noch moeglichen Impfungen fuer das gewaehlte Land.',
      },
      countryOnboarding: {
        title: 'Land fuer Empfehlungen auswaehlen',
        description:
          'Das Land steuert, welche Impfungen im Katalog als empfohlen oder optional markiert sind.',
        hint: 'Du kannst die Auswahl spaeter jederzeit auf dieser Seite aendern.',
        confirm: 'Land bestaetigen',
      },
      country: {
        label: 'Empfehlungsland',
        description: 'Katalog und Kategorien unten beziehen sich auf das ausgewaehlte Land.',
        ru: 'Russland',
        de: 'Deutschland',
      },
      summary: {
        title: 'Uebersicht deiner Impfkarte',
        recordsTotal: 'Eintraege gesamt',
        withNextDate: 'Mit naechstem Datum',
        withoutNextDate: 'Ohne naechstes Datum',
      },
      form: {
        titleAdd: 'Erledigte Impfung eintragen',
        titleEdit: 'Eintrag bearbeiten',
        subtitle: 'Das naechste Impfdatum ist optional und wird manuell gesetzt.',
        noDiseasesForAdd: 'Alle relevanten Erkrankungen sind bereits in deiner Karte enthalten.',
        fields: {
          disease: 'Erkrankung',
          diseasePlaceholder: 'Erkrankung auswaehlen',
          completedAt: 'Datum der erledigten Impfung',
          nextDueAt: 'Naechstes Impfdatum',
        },
        actions: {
          saveAdd: 'Eintrag speichern',
          saveEdit: 'Aenderungen speichern',
          cancelEdit: 'Bearbeitung abbrechen',
        },
        errors: {
          diseaseRequired: 'Waehle eine Erkrankung aus.',
          completedRequired: 'Bitte ein gueltiges Datum der erledigten Impfung angeben.',
          nextBeforeCompleted: 'Das naechste Datum darf nicht vor dem erledigten Datum liegen.',
        },
      },
      records: {
        title: 'Eingetragene Impfungen',
        empty: 'Noch keine Eintraege. Fuege links die erste Impfung hinzu.',
        completedLabel: 'Erledigt',
        actions: {
          edit: 'Bearbeiten',
          delete: 'Loeschen',
        },
      },
      catalog: {
        title: 'Noch moegliche Impfungen',
        description:
          'Es werden nur Erkrankungen gezeigt, die fuer das gewaehlte Land relevant und noch nicht eingetragen sind.',
        searchLabel: 'Erkrankung suchen',
        searchPlaceholder: 'Zum Beispiel: tetanus, masern, hpv',
        countLabel: 'Passende Impfungen: {{count}}',
        empty: 'Keine passenden Erkrankungen fuer die aktuellen Filter.',
        filters: {
          all: 'Alle',
          recommended: 'Empfohlen',
          optional: 'Optional',
        },
        badges: {
          recommended: 'Empfohlen',
          optional: 'Optional',
        },
      },
      timeline: {
        title: 'Zeitlinie bis zur naechsten Impfung',
        completed: 'Erledigt',
        due: 'Naechste',
        status: {
          overdue: 'Datum ist bereits vorbei',
          today: 'Datum ist heute',
          upcoming: 'Datum liegt in der Zukunft',
        },
      },
      diseases: {
        anthrax: 'Milzbrand',
        cholera: 'Cholera',
        covid19: 'COVID-19',
        dengue: 'Dengue',
        diphtheria: 'Diphtherie',
        ebola: 'Ebola',
        haemophilusInfluenzaeTypeB: 'Haemophilus influenzae Typ B (Hib)',
        hepatitisA: 'Hepatitis A',
        hepatitisB: 'Hepatitis B',
        humanPapillomavirus: 'Humanes Papillomavirus (HPV)',
        influenza: 'Influenza',
        japaneseEncephalitis: 'Japanische Enzephalitis',
        malaria: 'Malaria',
        measles: 'Masern',
        meningococcalDisease: 'Meningokokken-Erkrankung',
        mumps: 'Mumps',
        mpox: 'Mpox',
        pertussis: 'Pertussis (Keuchhusten)',
        pneumococcalDisease: 'Pneumokokken-Erkrankung',
        poliomyelitis: 'Poliomyelitis',
        rabies: 'Tollwut',
        respiratorySyncytialVirus: 'Respiratorisches Synzytialvirus (RSV)',
        rotavirus: 'Rotavirus',
        rubella: 'Roeteln',
        shingles: 'Guertelrose (Herpes zoster)',
        smallpox: 'Pocken',
        tetanus: 'Tetanus',
        tickBorneEncephalitis: 'Fruehsommer-Meningoenzephalitis (FSME)',
        tuberculosis: 'Tuberkulose',
        typhoidFever: 'Typhus',
        varicella: 'Varizellen',
        yellowFever: 'Gelbfieber',
      },
    },
  },
} as const;
