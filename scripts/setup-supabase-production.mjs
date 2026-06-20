/**
 * Full Supabase setup for PetalFlow production auth:
 * - Apply SQL migrations
 * - Ensure storage bucket + RLS
 * - Create/sync auth users + public.users profiles
 * - Configure auth redirect URLs when SUPABASE_ACCESS_TOKEN is set
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const DEFAULT_EMAIL = "luca@petalflow.app";
const DEFAULT_PASSWORD = "PetalFlow2026!";
const DEFAULT_NAME = "Luca R.";

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
  return m?.[1] ?? null;
}

async function connectPostgres(env) {
  const ref = projectRefFromUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  const dbPassword = env.SUPABASE_DB_PASSWORD;
  if (!ref) throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL");
  if (!dbPassword) throw new Error("Missing SUPABASE_DB_PASSWORD in .env.local");

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

  let lastErr;
  for (const connectionString of candidates) {
    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      console.log("Connected to Supabase Postgres");
      return client;
    } catch (err) {
      lastErr = err;
      await client.end().catch(() => {});
    }
  }

  throw lastErr ?? new Error("Could not connect to Supabase Postgres");
}

function serviceHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

async function runSqlFile(client, filePath) {
  const sql = readFileSync(filePath, "utf8");
  console.log(`Running ${filePath.replace(root + "\\", "").replace(root + "/", "")}...`);
  try {
    await client.query(sql);
    console.log("  OK");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("already exists") ||
      msg.includes("duplicate") ||
      msg.includes("does not exist, skipping")
    ) {
      console.log(`  Skipped: ${msg.slice(0, 100)}`);
      return;
    }
    throw err;
  }
}

async function ensureAuthUser(env, email, password, fullName) {
  const base = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  const headers = serviceHeaders(env.SUPABASE_SERVICE_ROLE_KEY);

  const listRes = await fetch(`${base}/auth/v1/admin/users?page=1&per_page=100`, {
    headers,
  });
  if (!listRes.ok) {
    throw new Error(`List users failed: ${listRes.status} ${await listRes.text()}`);
  }

  const list = await listRes.json();
  let user = list.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    const createRes = await fetch(`${base}/auth/v1/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      }),
    });
    if (!createRes.ok) {
      throw new Error(`Create user failed: ${createRes.status} ${await createRes.text()}`);
    }
    user = await createRes.json();
    console.log(`Created auth user: ${email}`);
  } else {
    const updateRes = await fetch(`${base}/auth/v1/admin/users/${user.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      }),
    });
    if (!updateRes.ok) {
      throw new Error(`Update user failed: ${updateRes.status} ${await updateRes.text()}`);
    }
    user = await updateRes.json();
    console.log(`Updated auth user: ${email}`);
  }

  return user;
}

async function syncPublicUsers(client) {
  await client.query(`
    INSERT INTO public.users (id, email, full_name, is_pro)
    SELECT
      u.id,
      u.email,
      COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
      CASE WHEN u.email = '${DEFAULT_EMAIL}' THEN true ELSE false END
    FROM auth.users u
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      is_pro = EXCLUDED.is_pro,
      updated_at = NOW();
  `);
  console.log("Synced public.users from auth.users");
}

async function configureAuthUrls(env, client) {
  const token = env.SUPABASE_ACCESS_TOKEN;
  const ref = projectRefFromUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  const siteUrl = (env.NEXT_PUBLIC_APP_URL ?? "https://petaflow.vercel.app").replace(
    /\/$/,
    ""
  );
  const redirectUrls = [
    `${siteUrl}/auth/callback`,
    "https://petaflow.vercel.app/auth/callback",
    "http://localhost:3000/auth/callback",
  ];

  if (await tryGoTrueAdminConfig(env, siteUrl, redirectUrls)) {
    return true;
  }

  if (await trySqlAuthConfig(client, siteUrl, redirectUrls)) {
    return true;
  }

  if (!token) {
    console.log(
      "Auth URL SQL update unavailable and SUPABASE_ACCESS_TOKEN not set."
    );
    console.log("Set redirect URLs manually in Supabase → Authentication → URL Configuration:");
    console.log(`  Site URL: ${siteUrl}`);
    for (const url of redirectUrls) console.log(`  Redirect URL: ${url}`);
    return false;
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      site_url: siteUrl,
      uri_allow_list: redirectUrls.join(","),
      disable_signup: false,
      mailer_autoconfirm: true,
      external_email_enabled: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Auth config PATCH failed: ${res.status} ${await res.text()}`);
  }

  console.log(`Auth URLs configured via Management API — site_url=${siteUrl}`);
  return true;
}

async function tryGoTrueAdminConfig(env, siteUrl, redirectUrls) {
  try {
    const base = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
    const headers = serviceHeaders(env.SUPABASE_SERVICE_ROLE_KEY);
    const res = await fetch(`${base}/auth/v1/admin/config`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        site_url: siteUrl,
        uri_allow_list: redirectUrls.join(","),
        mailer_autoconfirm: true,
        disable_signup: false,
      }),
    });

    if (!res.ok) {
      console.log(`GoTrue admin config skipped: HTTP ${res.status}`);
      return false;
    }

    console.log(`Auth URLs configured via GoTrue admin — site_url=${siteUrl}`);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`GoTrue admin config skipped: ${msg.slice(0, 120)}`);
    return false;
  }
}

async function trySqlAuthConfig(client, siteUrl, redirectUrls) {
  try {
    const { rows } = await client.query(
      "SELECT id, raw_base_config FROM auth.instances LIMIT 1"
    );
    if (!rows[0]) return false;

    const config =
      typeof rows[0].raw_base_config === "string"
        ? JSON.parse(rows[0].raw_base_config)
        : rows[0].raw_base_config ?? {};

    config.SITE_URL = siteUrl;
    config.URI_ALLOW_LIST = redirectUrls;
    config.ADDITIONAL_REDIRECT_URLS = redirectUrls;
    config.MAILER_AUTOCONFIRM = true;
    config.DISABLE_SIGNUP = false;

    await client.query(
      "UPDATE auth.instances SET raw_base_config = $1::jsonb, updated_at = NOW() WHERE id = $2",
      [JSON.stringify(config), rows[0].id]
    );

    console.log(`Auth URLs configured via auth.instances — site_url=${siteUrl}`);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`Auth SQL config skipped: ${msg.slice(0, 120)}`);
    return false;
  }
}

async function main() {
  const env = loadEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase URL or service role key in .env.local");
  }

  const client = await connectPostgres(env);

  try {
    await runSqlFile(client, join(root, "supabase", "bootstrap.sql"));

    const migrationsDir = join(root, "supabase", "migrations");
    const migrationFiles = readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      await runSqlFile(client, join(migrationsDir, file));
    }

    await syncPublicUsers(client);

    const user = await ensureAuthUser(
      env,
      DEFAULT_EMAIL,
      DEFAULT_PASSWORD,
      DEFAULT_NAME
    );

    await client.query(
      `INSERT INTO public.users (id, email, full_name, is_pro)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         full_name = EXCLUDED.full_name,
         is_pro = EXCLUDED.is_pro,
         updated_at = NOW()`,
      [user.id, DEFAULT_EMAIL, DEFAULT_NAME]
    );

    await configureAuthUrls(env, client);

    console.log("\nSetup complete.");
    console.log(`Login email: ${DEFAULT_EMAIL}`);
    console.log(`Login password: ${DEFAULT_PASSWORD}`);
    console.log(`User ID: ${user.id}`);
    console.log(`App URL: ${env.NEXT_PUBLIC_APP_URL ?? "https://petaflow.vercel.app"}`);
    console.log("Login page: /login");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
