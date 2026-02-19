import { defineConfig } from 'drizzle-kit';

const defaultDatabaseUrl = 'postgres://postgres:postgres@localhost:5432/impfungen';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  },
  strict: true,
  verbose: true,
});
