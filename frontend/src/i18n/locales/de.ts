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
        missingVerifier: 'code_verifier für den OAuth-Callback fehlt.',
        providerError: 'Der OAuth-Provider hat einen Fehler zurückgegeben.',
        stateMismatch: 'OAuth-State-Pruefung fehlgeschlagen. Bitte erneut anmelden.',
        unexpected: 'Unerwarteter OAuth-Fehler.',
      },
    },
    hero: {
      badge: 'Impfkalender',
      title: 'Behalte alle Impfungen im Blick',
      description:
        'Verwalte deinen Impfkalender, trage bereits gemachte Impfungen ein und sieh rechtzeitig, wann die nächste fällig ist.',
      features: {
        historyTitle: 'Impfverlauf',
        historyDescription:
          'Speichere erledigte Impfungen an einem Ort, damit dein aktueller Status sofort sichtbar ist.',
        scheduleTitle: 'Nächste Termine',
        scheduleDescription:
          'Sieh kommende Impfungen fruehzeitig und halte empfohlene Zeitpunkte einfacher ein.',
        remindersTitle: 'Klare Erinnerungen',
        remindersDescription:
          'Erhalte rechtzeitig Hinweise auf die nächste Impfung, ohne selbst Fristen zu verfolgen.',
      },
    },
    internal: {
      nav: {
        journal: 'Journal',
        account: 'Profil',
      },
      page: {
        title: 'Meine Impfungen und kommende Termine',
        description:
          'Erfasse erledigte Impfungen, trage das nächste Datum manuell ein und sehe alle noch möglichen Impfungen für das gewählte Land.',
      },
      countryOnboarding: {
        title: 'Land für Empfehlungen auswählen',
        description:
          'Das Land steuert, welche Impfungen im Katalog als empfohlen oder optional markiert sind.',
        hint: 'Du kannst die Auswahl spaeter jederzeit auf dieser Seite ändern.',
      },
      country: {
        label: 'Empfehlungsland',
        description: 'Katalog und Kategorien unten beziehen sich auf das ausgewählte Land.',
        descriptionNoRecommendations:
          'Es wird ein universeller Katalog ohne Empfehlungsmarkierungen gezeigt.',
        ru: 'Russland',
        de: 'Deutschland',
        none: 'Ohne Empfehlungen',
      },
      summary: {
        title: 'Uebersicht deiner Impfkarte',
        recordsTotal: 'Eintraege gesamt',
        withNextDate: 'Mit nächstem Termin',
        withoutNextDate: 'Ohne nächstes Datum',
      },
      upcomingYear: {
        title: 'Impfungen im nächsten Jahr',
        description: 'Liste der Impfungen, die in den nächsten 12 Monaten geplant sind.',
        dueLabel: 'Datum',
        typeLabel: 'Typ',
        empty: 'Für das nächste Jahr sind nach aktuellen Daten keine Impfungen fällig.',
      },
      form: {
        titleAdd: 'Erledigte Impfung eintragen',
        titleEdit: 'Eintrag bearbeiten',
        subtitle: 'Erfasse Impfdaten und konfiguriere optional den zukünftigen Plan.',
        markDoneSubtitle: 'Bestätige Datum und Typ der tatsächlich erledigten Impfung.',
        noDiseasesForAdd: 'Alle relevanten Erkrankungen sind bereits in deiner Karte enthalten.',
        modal: {
          title: 'Impfungsformular',
          completeDoseTitle: 'Impfung als erledigt markieren',
        },
        fields: {
          batchNumber: 'Chargennummer',
          completedDoseKind: 'Typ der erledigten Impfung',
          disease: 'Erkrankung',
          diseasePlaceholder: 'Erkrankung auswählen',
          completedAt: 'Datum der erledigten Impfung',
          futureDate: 'Zukünftiges Datum {{index}}',
          plannedDoseKind: 'Typ der geplanten Impfung',
          repeatInterval: 'Wiederholungsintervall',
          repeatUnit: 'Intervall-Einheit',
          scheduleMode: 'Planung nächster Dosen',
          tradeName: 'Handelsname',
        },
        schedule: {
          modes: {
            none: 'Keine Planung',
            manual: 'Daten manuell eingeben',
            repeat: 'Nach Intervall wiederholen',
          },
        },
        repeatUnits: {
          months: 'Monate',
          years: 'Jahre',
        },
        actions: {
          addDate: 'Datum hinzufügen',
          addDose: 'Dosis/Revakzinierung hinzufügen',
          closeModal: 'Schliessen',
          editDose: 'Dosis bearbeiten',
          markPlannedDone: 'Als erledigt markieren',
          removeDate: 'Datum entfernen',
          openModal: 'Erledigte Impfung eintragen',
          saveCompletedDose: 'Erledigte Impfung speichern',
          saveAdd: 'Eintrag speichern',
          saveEdit: 'Änderungen speichern',
          cancelEdit: 'Bearbeitung abbrechen',
        },
        errors: {
          completedInFuture: 'Das Datum der erledigten Impfung darf nicht in der Zukunft liegen.',
          diseaseRequired: 'Wähle eine Erkrankung aus.',
          completedRequired: 'Bitte ein gueltiges Datum der erledigten Impfung angeben.',
          doseKindInvalid: 'Bitte einen gueltigen Impfungs-Typ auswählen.',
          futureDateBeforeCompleted:
            'Ein zukünftiges Datum darf nicht vor dem erledigten Datum liegen.',
          futureDatesDuplicate: 'Zukünftige Daten duerfen sich nicht wiederholen.',
          futureDatesInvalid: 'Bitte pruefe die eingegebenen zukünftigen Daten.',
          repeatIntervalInvalid:
            'Bitte ein gueltiges Wiederholungsintervall angeben (ganze Zahl > 0).',
          saveFailed: 'Änderungen konnten nicht gespeichert werden. Bitte erneut versuchen.',
          scheduleConflict: 'Bitte entweder manuelle Daten oder Wiederholungsintervall auswählen.',
          syncConflict:
            'Der Eintrag wurde in einer anderen Sitzung geändert. Bitte aktualisieren und erneut versuchen.',
        },
      },
      records: {
        title: 'Eingetragene Impfungen',
        empty: 'Noch keine Eintraege.',
        batchNumberLabel: 'Charge',
        completedLabel: 'Erledigt',
        vaccinationDateLabel: 'Impfdatum',
        latestDoseLabel: 'Datum der letzten Impfung',
        nextDoseLabel: 'Datum der nächsten Impfung',
        futureDatesLabel: 'Zukünftige Daten',
        nextDueTypeLabel: 'Typ der nächsten Impfung',
        repeatEveryLabel: 'Wiederholung',
        repeatPattern: 'Alle {{interval}} {{unit}}',
        repeatUnits: {
          months_one: 'Monat',
          months_other: 'Monate',
          years_one: 'Jahr',
          years_other: 'Jahre',
        },
        tradeNameLabel: 'Handelsname',
        history: {
          show: 'Historie anzeigen ({{count}})',
          hide: 'Historie ausblenden ({{count}})',
        },
        actions: {
          edit: 'Bearbeiten',
          delete: 'Löschen',
        },
        import: {
          inputLabel: 'CSV-Datei mit erledigten Impfungen',
          actions: {
            csv: 'CSV importieren',
            csvLoading: 'CSV wird importiert...',
          },
          error: {
            invalidFile: 'CSV konnte nicht gelesen werden. Bitte Dateiformat pruefen.',
            processFailed:
              'Import wegen eines internen Fehlers fehlgeschlagen. Bitte erneut versuchen.',
            readFailed: 'Die ausgewählte Datei konnte nicht gelesen werden.',
            targetUnavailable: 'Aktuelles Zielprofil für den Import konnte nicht bestimmt werden.',
            unsupportedHeader:
              'Diese CSV sieht nicht wie ein App-Export aus (ungueltige Kopfzeile).',
          },
          report: {
            summary: 'Ergebnis des CSV-Imports',
            noRows: 'Die Datei enthaelt keine Zeilen mit erledigten Impfungen.',
            counts: {
              totalRows: 'Zeilen in Datei: {{count}}',
              importedRows: 'Importiert: {{count}}',
              duplicateRows: 'Duplikate uebersprungen: {{count}}',
              invalidRows: 'Zeilen mit Fehlern: {{count}}',
            },
            rowError: {
              line: 'Zeile {{rowNumber}}: {{message}}',
              invalidColumns: 'Ungueltige Anzahl von Spalten.',
              invalidCompletedAt: 'Ungueltiges Impfdatum.',
              persistFailed: 'Diese Zeile konnte nicht gespeichert werden.',
              unknownDisease: 'Unbekannte Erkrankung.',
              unknownDoseKind: 'Unbekannter Dosis-Typ.',
            },
          },
        },
        export: {
          unnamedProfile: 'Profil',
          error: 'Datei konnte nicht exportiert werden. Bitte erneut versuchen.',
          actions: {
            csv: 'CSV exportieren',
            pdf: 'PDF exportieren',
            pdfLoading: 'PDF wird vorbereitet...',
          },
          columns: {
            completedAt: 'Datum',
            disease: 'Erkrankung',
            doseKind: 'Dosis-Typ',
            tradeName: 'Handelsname',
            batchNumber: 'Charge',
          },
          pdf: {
            title: 'Erledigte Impfungen',
            profileLabel: 'Profil',
            exportedAtLabel: 'Exportiert am',
            recordsCountLabel: 'Anzahl Eintraege',
          },
        },
        deleteConfirm: {
          title: 'Eintrag löschen?',
          message: 'Bist du sicher, dass du den Impfeintrag für „{{disease}}“ löschen willst?',
          warning: 'Diese Aktion kann nicht rückgaengig gemacht werden.',
          requestFailed: 'Eintrag konnte nicht gelöscht werden. Bitte erneut versuchen.',
          cancel: 'Abbrechen',
          confirm: 'Eintrag löschen',
        },
        deleteDoseConfirm: {
          title: 'Dosis aus der Historie löschen?',
          message: 'Möchtest du den Eintrag für „{{disease}}“ vom {{date}} löschen?',
          warning: 'Diese Aktion kann nicht rückgaengig gemacht werden.',
          requestFailed: 'Dosis konnte nicht gelöscht werden. Bitte erneut versuchen.',
          cancel: 'Abbrechen',
          confirm: 'Dosis löschen',
        },
      },
      doseKind: {
        nextDose: 'Nächste Dosis',
        revaccination: 'Revakzinierung',
      },
      catalog: {
        title: 'Noch mögliche Impfungen',
        description:
          'Es werden nur Erkrankungen gezeigt, die für das gewählte Land relevant und noch nicht eingetragen sind.',
        descriptionNoRecommendations:
          'Es wird eine universelle Liste ohne Kennzeichnung als empfohlen oder optional gezeigt.',
        searchLabel: 'Erkrankung suchen',
        searchPlaceholder: 'Zum Beispiel: tetanus, masern, hpv',
        countLabel: 'Passende Impfungen: {{count}}',
        empty: 'Keine passenden Erkrankungen für die aktuellen Filter.',
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
        title: 'Zeitlinie bis zur nächsten Impfung',
        completed: 'Erledigt',
        due: 'Nächste',
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
        pertussis: 'Pertussis',
        pneumococcalDisease: 'Pneumokokken-Erkrankung',
        poliomyelitis: 'Poliomyelitis',
        rabies: 'Tollwut',
        respiratorySyncytialVirus: 'RSV-Infektion (respiratorisches Synzytialvirus)',
        rotavirus: 'Rotavirus',
        rubella: 'Röteln',
        shingles: 'Guertelrose (Herpes zoster)',
        smallpox: 'Pocken',
        tetanus: 'Tetanus',
        tickBorneEncephalitis: 'Frühsommer-Meningoenzephalitis (FSME)',
        tuberculosis: 'Tuberkulose',
        typhoidFever: 'Typhus abdominalis',
        varicella: 'Varizellen',
        yellowFever: 'Gelbfieber',
      },
    },
    account: {
      page: {
        title: 'Konto und Familie',
        description: 'Verwalte Familienprofile und Einstellungen für den Impfkalender.',
        empty: 'Konten sind noch nicht geladen.',
      },
      mandatory: {
        title: 'Hauptkonto ausfuellen',
        description:
          'Bitte Name, Geburtsjahr und Land für den Impfkalender des Hauptkontos angeben, um fortzufahren.',
      },
      list: {
        title: 'Konten',
        description: 'Zwischen Familienprofilen wechseln.',
        selectLabel: 'Ausgewähltes Konto',
        selected: 'Ausgewählt',
      },
      edit: {
        title: 'Kontodaten',
        description: 'Daten des ausgewählten Kontos bearbeiten.',
        primaryDescription: 'Bitte die Daten des Hauptkontos vervollstaendigen.',
      },
      add: {
        title: 'Familienmitglied hinzufügen',
        description: 'Name und Geburtsjahr genuegen. Das Land kann spaeter gewählt werden.',
      },
      fields: {
        name: 'Name',
        birthYear: 'Geburtsjahr',
        country: 'Land des Impfkalenders',
        countryUnset: 'Kein Land ausgewählt',
      },
      placeholders: {
        noName: 'Ohne Namen',
        noBirthYear: 'Jahr fehlt',
      },
      kinds: {
        primary: 'Hauptkonto',
        family: 'Familie',
      },
      actions: {
        save: 'Speichern',
        saving: 'Speichert...',
        addMember: 'Familienmitglied hinzufügen',
        adding: 'Wird hinzugefügt...',
        deleteMember: 'Familienmitglied löschen',
        deleting: 'Wird gelöscht...',
      },
      validation: {
        nameRequired: 'Bitte Namen angeben',
        birthYearInvalid: 'Bitte ein gueltiges Geburtsjahr eingeben ({{min}}-{{max}})',
        countryRequired: 'Bitte Land des Impfkalenders wählen',
      },
      errors: {
        saveFailed: 'Konto konnte nicht gespeichert werden, bitte erneut versuchen',
        createFailed: 'Familienmitglied konnte nicht hinzugefügt werden, bitte erneut versuchen',
        deleteFailed: 'Familienmitglied konnte nicht gelöscht werden, bitte erneut versuchen',
      },
      deleteConfirm: {
        title: 'Familienmitglied löschen?',
        message: 'Sind Sie sicher, dass Sie das Profil "{{name}}" löschen möchten?',
        warning: 'Diese Aktion kann nicht rückgaengig gemacht werden.',
        cancel: 'Abbrechen',
        confirm: 'Löschen',
      },
    },
  },
} as const;
