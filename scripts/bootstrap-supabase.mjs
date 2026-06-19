/**
 * Bootstrap Supabase: run migrations + create default user.
 * Requires SUPABASE_DB_PASSWORD in .env.local (Settings → Database → password).
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) throw new Error(".env.local not found");
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

function projectRefFromUrl(url) {
  const m = url?.match(/https:\/\/([^.]+)\.supabase\.co/);
  return m?.[1];
}

const MIGRATION_FILES = ["supabase/bootstrap.sql"];

const SEED_USER_SQL = `
-- Default app user (idempotent)
DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'luca@petalflow.app' LIMIT 1;
  IF uid IS NULL THEN
    RAISE NOTICE 'No auth user luca@petalflow.app — create in Dashboard → Authentication → Users';
  ELSE
    INSERT INTO public.users (id, email, full_name, is_pro)
    VALUES (uid, 'luca@petalflow.app', 'Luca R.', true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      is_pro = EXCLUDED.is_pro;
    RAISE NOTICE 'Synced public.users for %', uid;
  END IF;
END $$;
`;

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const ref = projectRefFromUrl(url);
  const dbPassword = env.SUPABASE_DB_PASSWORD;

  if (!ref) throw new Error("NEXT_PUBLIC_SUPABASE_URL missing or invalid");
  if (!dbPassword) {
    throw new Error(
      "Add SUPABASE_DB_PASSWORD to .env.local (Supabase → Settings → Database → Database password)"
    );
  }

  const encoded = encodeURIComponent(dbPassword);
  const poolerRegions = [
    "aws-1-us-east-2",
    "aws-0-us-east-1",
    "aws-0-us-east-2",
    "aws-0-us-west-1",
    "aws-0-us-west-2",
  ];
  const candidates = [
    env.SUPABASE_DB_URL,
    `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
    ...poolerRegions.flatMap((region) => [
      `postgresql://postgres.${ref}:${encoded}@${region}.pooler.supabase.com:5432/postgres`,
      `postgresql://postgres.${ref}:${encoded}@${region}.pooler.supabase.com:6543/postgres`,
    ]),
  ].filter(Boolean);

  let client;
  let lastErr;
  for (const connectionString of candidates) {
    const c = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
      await c.connect();
      client = c;
      console.log("Connected to Supabase Postgres");
      break;
    } catch (err) {
      lastErr = err;
      await c.end().catch(() => {});
    }
  }
  if (!client) throw lastErr ?? new Error("Could not connect to Supabase Postgres");

  for (const file of MIGRATION_FILES) {
    const sql = readFileSync(join(root, file), "utf8");
    console.log(`Running ${file}...`);
    try {
      await client.query(sql);
      console.log(`  OK`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        console.log(`  Skipped (already applied): ${msg.slice(0, 80)}`);
      } else {
        throw err;
      }
    }
  }

  console.log("Seeding user profile...");
  await client.query(SEED_USER_SQL);

  const { rows } = await client.query(
    `SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1`
  );
  if (rows[0]?.id) {
    console.log(`\nPETALFLOW_DEFAULT_USER_ID=${rows[0].id}`);
  }

  await client.end();
  console.log("\nBootstrap complete.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
