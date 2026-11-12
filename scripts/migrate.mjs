// Applies supabase/migrations/*.sql to DATABASE_URL in filename order.
// Applied versions are recorded in supabase_migrations.schema_migrations, the
// same table the Supabase CLI uses, so `supabase migration list` stays in sync.
// Railway runs this as the RaiseOS service's pre-deploy command.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("migrate: DATABASE_URL is not set, skipping.");
  process.exit(0);
}

const dir = path.join(process.cwd(), "supabase", "migrations");
const files = (await readdir(dir)).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(`
    create schema if not exists supabase_migrations;
    create table if not exists supabase_migrations.schema_migrations (
      version text primary key,
      statements text[],
      name text
    );`);
  const { rows } = await client.query("select version from supabase_migrations.schema_migrations");
  const applied = new Set(rows.map((r) => r.version));

  for (const file of files) {
    const [, version, name] = file.match(/^(\d+)_(.+)\.sql$/);
    if (applied.has(version)) continue;
    const sql = await readFile(path.join(dir, file), "utf8");
    console.log(`migrate: applying ${file}`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(
        "insert into supabase_migrations.schema_migrations (version, statements, name) values ($1, $2, $3)",
        [version, [sql], name],
      );
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw new Error(`migrate: ${file} failed: ${error.message}`);
    }
  }
  console.log(`migrate: up to date (${files.length} migration file(s)).`);
} finally {
  await client.end();
}
