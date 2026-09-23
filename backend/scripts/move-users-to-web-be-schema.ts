import 'dotenv/config';
import Knex from 'knex';

/**
 * One-shot ops script: move `users` and `payment_methods` from payment_svc's
 * schema into web-be's `web-be` schema, and mark web-be's migrations as already
 * applied so the service does not try to re-create the tables.
 *
 * Usage:
 *   npm run move-users-schema
 *   SOURCE_SCHEMA=avaramp TARGET_SCHEMA=web-be npm run move-users-schema
 *
 * Run this against an existing deployment that already has the tables under
 * payment_svc's schema. Fresh installs should let web-be's migrations create
 * the tables instead and NOT run this script.
 */

const sourceSchema = process.env.SOURCE_SCHEMA ?? 'avaramp';
const targetSchema = process.env.TARGET_SCHEMA ?? process.env.DB_SCHEMA ?? 'web-be';

const APPLIED_MIGRATIONS = [
  '001_create_users.ts',
  '002_create_payment_methods.ts',
  '003_add_user_auth_fields.ts',
];

async function tableExists(knex: Knex.Knex, schema: string, table: string): Promise<boolean> {
  const result = await knex.raw(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
    [schema, table],
  );
  return (result.rows?.length ?? 0) > 0;
}

async function moveTable(knex: Knex.Knex, table: string): Promise<void> {
  const inSource = await tableExists(knex, sourceSchema, table);
  const inTarget = await tableExists(knex, targetSchema, table);

  if (!inSource) {
    console.log(`- ${sourceSchema}.${table}: not present in source, skipping`);
    return;
  }
  if (inTarget) {
    console.log(`- ${targetSchema}.${table}: already present in target, skipping move`);
    return;
  }

  console.log(`- Moving ${sourceSchema}.${table} -> ${targetSchema}.${table}`);
  await knex.raw(`ALTER TABLE "${sourceSchema}"."${table}" SET SCHEMA "${targetSchema}"`);
}

async function markMigrationsApplied(knex: Knex.Knex): Promise<void> {
  const exists = await tableExists(knex, targetSchema, 'knex_migrations');
  if (!exists) {
    await knex.raw(`
      CREATE TABLE "${targetSchema}"."knex_migrations" (
        id serial primary key,
        name varchar(255),
        batch integer,
        migration_time timestamptz
      )
    `);
  }
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "${targetSchema}"."knex_migrations_lock" (
      index integer primary key,
      is_locked integer
    )
  `);

  for (const name of APPLIED_MIGRATIONS) {
    const existing = await knex.raw(
      `SELECT 1 FROM "${targetSchema}"."knex_migrations" WHERE name = ?`,
      [name],
    );
    if ((existing.rows?.length ?? 0) > 0) {
      console.log(`- Migration already recorded: ${name}`);
      continue;
    }
    await knex.raw(
      `INSERT INTO "${targetSchema}"."knex_migrations" (name, batch, migration_time) VALUES (?, ?, now())`,
      [name, 1],
    );
    console.log(`- Recorded migration: ${name}`);
  }
}

async function main(): Promise<void> {
  if (sourceSchema === targetSchema) {
    throw new Error(`SOURCE_SCHEMA and TARGET_SCHEMA are both "${sourceSchema}"`);
  }

  const sslEnabled = process.env.DB_SSL !== 'false';
  const knex = Knex({
    client: 'pg',
    connection: {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'avaramp',
      ssl: sslEnabled ? { rejectUnauthorized: false } : (false as const),
    },
  });

  try {
    console.log(`Moving user tables into schema "${targetSchema}"...`);
    await knex.raw(`CREATE SCHEMA IF NOT EXISTS "${targetSchema}"`);

    // users first: payment_methods has an FK to users.
    await moveTable(knex, 'users');
    await moveTable(knex, 'payment_methods');

    await markMigrationsApplied(knex);
    console.log('Done.');
  } finally {
    await knex.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
