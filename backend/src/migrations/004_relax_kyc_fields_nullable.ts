import type { Knex } from 'knex';

const schema = process.env.DB_SCHEMA ?? 'web-be';

export async function up(knex: Knex): Promise<void> {
  if (knex.client.driverName !== 'pg') return;
  await knex.raw('ALTER TABLE ??.?? ALTER COLUMN ?? DROP NOT NULL', [schema, 'users', 'id_number']);
  await knex.raw('ALTER TABLE ??.?? ALTER COLUMN ?? DROP NOT NULL', [schema, 'users', 'dob']);
}

export async function down(knex: Knex): Promise<void> {
  if (knex.client.driverName !== 'pg') return;
  await knex.raw('ALTER TABLE ??.?? ALTER COLUMN ?? SET NOT NULL', [schema, 'users', 'id_number']);
  await knex.raw('ALTER TABLE ??.?? ALTER COLUMN ?? SET NOT NULL', [schema, 'users', 'dob']);
}
