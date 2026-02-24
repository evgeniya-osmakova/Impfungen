CREATE TABLE IF NOT EXISTS "profile_member" (
  "id" serial PRIMARY KEY,
  "app_profile_id" integer NOT NULL REFERENCES "app_profile"("id") ON DELETE cascade,
  "kind" text NOT NULL,
  "name" text,
  "birth_year" integer,
  "country" text,
  "sort_order" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "profile_member_kind_check" CHECK ("kind" in ('primary', 'family')),
  CONSTRAINT "profile_member_country_check" CHECK ("country" is null or "country" in ('RU', 'DE', 'NONE')),
  CONSTRAINT "profile_member_birth_year_check" CHECK ("birth_year" is null or "birth_year" >= 1900),
  CONSTRAINT "profile_member_sort_order_check" CHECK ("sort_order" >= 0)
);

ALTER TABLE "app_profile"
ADD COLUMN IF NOT EXISTS "selected_member_id" integer;

ALTER TABLE "vaccination_series"
ADD COLUMN IF NOT EXISTS "member_id" integer REFERENCES "profile_member"("id") ON DELETE cascade;

ALTER TABLE "vaccination_series"
DROP CONSTRAINT IF EXISTS "vaccination_series_profile_disease_unique";

INSERT INTO "profile_member" ("app_profile_id", "kind", "country", "sort_order")
SELECT ap."id", 'primary', ap."country", 0
FROM "app_profile" ap
WHERE NOT EXISTS (
  SELECT 1
  FROM "profile_member" pm
  WHERE pm."app_profile_id" = ap."id"
    AND pm."kind" = 'primary'
);

UPDATE "app_profile" ap
SET "selected_member_id" = pm."id"
FROM "profile_member" pm
WHERE ap."id" = pm."app_profile_id"
  AND pm."kind" = 'primary'
  AND (
    ap."selected_member_id" IS NULL
    OR NOT EXISTS (
      SELECT 1
      FROM "profile_member" selected_pm
      WHERE selected_pm."id" = ap."selected_member_id"
        AND selected_pm."app_profile_id" = ap."id"
    )
  );

UPDATE "vaccination_series" vs
SET "member_id" = pm."id"
FROM "profile_member" pm
WHERE pm."app_profile_id" = vs."profile_id"
  AND pm."kind" = 'primary'
  AND vs."member_id" IS NULL;

ALTER TABLE "vaccination_series"
ALTER COLUMN "member_id" SET NOT NULL;

ALTER TABLE "vaccination_series"
ADD CONSTRAINT "vaccination_series_member_disease_unique" UNIQUE ("member_id", "disease_id");
