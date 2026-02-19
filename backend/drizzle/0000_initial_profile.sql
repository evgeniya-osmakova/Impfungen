CREATE TABLE IF NOT EXISTS "app_profile" (
  "id" integer PRIMARY KEY,
  "language" text NOT NULL DEFAULT 'ru',
  "country" text,
  "is_country_confirmed" boolean NOT NULL DEFAULT false,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "app_profile_id_check" CHECK ("id" = 1),
  CONSTRAINT "app_profile_language_check" CHECK ("language" in ('ru', 'de', 'en')),
  CONSTRAINT "app_profile_country_check" CHECK ("country" is null or "country" in ('RU', 'DE', 'NONE'))
);

CREATE TABLE IF NOT EXISTS "vaccination_series" (
  "id" serial PRIMARY KEY,
  "profile_id" integer NOT NULL REFERENCES "app_profile"("id") ON DELETE cascade,
  "disease_id" text NOT NULL,
  "repeat_interval" integer,
  "repeat_kind" text,
  "repeat_unit" text,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "vaccination_series_profile_disease_unique" UNIQUE ("profile_id", "disease_id"),
  CONSTRAINT "vaccination_series_repeat_consistency_check" CHECK (
    (("repeat_interval" is null and "repeat_kind" is null and "repeat_unit" is null)
    or ("repeat_interval" is not null and "repeat_kind" is not null and "repeat_unit" is not null))
  ),
  CONSTRAINT "vaccination_series_repeat_interval_check" CHECK ("repeat_interval" is null or "repeat_interval" > 0),
  CONSTRAINT "vaccination_series_repeat_kind_check" CHECK ("repeat_kind" is null or "repeat_kind" in ('nextDose', 'revaccination')),
  CONSTRAINT "vaccination_series_repeat_unit_check" CHECK ("repeat_unit" is null or "repeat_unit" in ('months', 'years'))
);

CREATE TABLE IF NOT EXISTS "completed_dose" (
  "id" serial PRIMARY KEY,
  "series_id" integer NOT NULL REFERENCES "vaccination_series"("id") ON DELETE cascade,
  "external_id" text NOT NULL,
  "completed_at" date NOT NULL,
  "kind" text NOT NULL,
  "batch_number" text,
  "trade_name" text,
  CONSTRAINT "completed_dose_series_external_unique" UNIQUE ("series_id", "external_id"),
  CONSTRAINT "completed_dose_kind_check" CHECK ("kind" in ('nextDose', 'revaccination'))
);

CREATE TABLE IF NOT EXISTS "planned_dose" (
  "id" serial PRIMARY KEY,
  "series_id" integer NOT NULL REFERENCES "vaccination_series"("id") ON DELETE cascade,
  "external_id" text NOT NULL,
  "due_at" date NOT NULL,
  "kind" text NOT NULL,
  CONSTRAINT "planned_dose_series_external_unique" UNIQUE ("series_id", "external_id"),
  CONSTRAINT "planned_dose_kind_check" CHECK ("kind" in ('nextDose', 'revaccination'))
);

INSERT INTO "app_profile" ("id", "language", "is_country_confirmed")
VALUES (1, 'ru', false)
ON CONFLICT ("id") DO NOTHING;
