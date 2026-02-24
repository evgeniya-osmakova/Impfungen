import { sql } from 'drizzle-orm';
import {
  check,
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const appProfile = pgTable(
  'app_profile',
  {
    id: integer('id').primaryKey(),
    language: text('language').notNull().default('ru'),
    selectedMemberId: integer('selected_member_id'),
    country: text('country'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('app_profile_id_check', sql`${table.id} = 1`),
    check('app_profile_language_check', sql`${table.language} in ('ru', 'de', 'en')`),
    check(
      'app_profile_country_check',
      sql`${table.country} is null or ${table.country} in ('RU', 'DE', 'NONE')`,
    ),
  ],
);

export const profileMember = pgTable(
  'profile_member',
  {
    id: serial('id').primaryKey(),
    appProfileId: integer('app_profile_id')
      .notNull()
      .references(() => appProfile.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    name: text('name'),
    birthYear: integer('birth_year'),
    country: text('country'),
    sortOrder: integer('sort_order').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('profile_member_kind_check', sql`${table.kind} in ('primary', 'family')`),
    check(
      'profile_member_country_check',
      sql`${table.country} is null or ${table.country} in ('RU', 'DE', 'NONE')`,
    ),
    check(
      'profile_member_birth_year_check',
      sql`${table.birthYear} is null or ${table.birthYear} >= 1900`,
    ),
    check(
      'profile_member_sort_order_check',
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);

export const vaccinationSeries = pgTable(
  'vaccination_series',
  {
    id: serial('id').primaryKey(),
    profileId: integer('profile_id')
      .notNull()
      .references(() => appProfile.id, { onDelete: 'cascade' }),
    memberId: integer('member_id')
      .notNull()
      .references(() => profileMember.id, { onDelete: 'cascade' }),
    diseaseId: text('disease_id').notNull(),
    repeatInterval: integer('repeat_interval'),
    repeatKind: text('repeat_kind'),
    repeatUnit: text('repeat_unit'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('vaccination_series_member_disease_unique').on(table.memberId, table.diseaseId),
    check(
      'vaccination_series_repeat_consistency_check',
      sql`((
        ${table.repeatInterval} is null
        and ${table.repeatKind} is null
        and ${table.repeatUnit} is null
      ) or (
        ${table.repeatInterval} is not null
        and ${table.repeatKind} is not null
        and ${table.repeatUnit} is not null
      ))`,
    ),
    check(
      'vaccination_series_repeat_interval_check',
      sql`${table.repeatInterval} is null or ${table.repeatInterval} > 0`,
    ),
    check(
      'vaccination_series_repeat_kind_check',
      sql`${table.repeatKind} is null or ${table.repeatKind} in ('nextDose', 'revaccination')`,
    ),
    check(
      'vaccination_series_repeat_unit_check',
      sql`${table.repeatUnit} is null or ${table.repeatUnit} in ('months', 'years')`,
    ),
  ],
);

export const completedDose = pgTable(
  'completed_dose',
  {
    id: serial('id').primaryKey(),
    seriesId: integer('series_id')
      .notNull()
      .references(() => vaccinationSeries.id, { onDelete: 'cascade' }),
    externalId: text('external_id').notNull(),
    completedAt: date('completed_at').notNull(),
    kind: text('kind').notNull(),
    batchNumber: text('batch_number'),
    tradeName: text('trade_name'),
  },
  (table) => [
    unique('completed_dose_series_external_unique').on(table.seriesId, table.externalId),
    check('completed_dose_kind_check', sql`${table.kind} in ('nextDose', 'revaccination')`),
  ],
);

export const plannedDose = pgTable(
  'planned_dose',
  {
    id: serial('id').primaryKey(),
    seriesId: integer('series_id')
      .notNull()
      .references(() => vaccinationSeries.id, { onDelete: 'cascade' }),
    externalId: text('external_id').notNull(),
    dueAt: date('due_at').notNull(),
    kind: text('kind').notNull(),
  },
  (table) => [
    unique('planned_dose_series_external_unique').on(table.seriesId, table.externalId),
    check('planned_dose_kind_check', sql`${table.kind} in ('nextDose', 'revaccination')`),
  ],
);
