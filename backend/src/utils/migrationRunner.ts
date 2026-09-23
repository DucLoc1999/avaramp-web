import db from '../db';
import { databaseConfig } from '../config/database';
import { logger } from '../config/logger';

export async function runMigrations(): Promise<void> {
  // Ensure the target schema exists before knex creates its migration table.
  // Otherwise a fresh database records migrations in `public` on the first run,
  // and the next run resolves `knex_migrations` in `web-be` (now that it exists)
  // and re-runs every migration. Creating the schema first makes the migration
  // table resolve in the same schema on every run.
  await db.raw('CREATE SCHEMA IF NOT EXISTS ??', [databaseConfig.schema]);

  const [, log] = await db.migrate.latest();
  if (log.length > 0) {
    logger.info({ migrations: log }, `Ran ${log.length} migration(s)`);
  }
}
