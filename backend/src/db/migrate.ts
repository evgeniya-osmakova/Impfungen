import path from 'node:path';

import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { db } from './client.js';

export const runMigrations = async (): Promise<void> => {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), 'drizzle'),
  });
};
