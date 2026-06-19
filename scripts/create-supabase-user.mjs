/**
 * Create Supabase auth user + sync profile (no DB password required).
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  const path = join(join(root, ".env.local"));
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

function setEnvUserId(userId) {
  const path = join(root, ".env.local");
  let content = readFileSync(path, "utf8");
  if (/^PETALFLOW_DEFAULT_USER_ID=.*/m.test(content)) {
    content = content.replace(/^PETALFLOW_DEFAULT_USER_ID=.*/m, `PETALFLOW_DEFAULT_USER_ID=${userId}`);
  } else {
    content += `\nPETALFLOW_DEFAULT_USER_ID=${userId}\n`;
  }
  writeFileSync(path, content, "utf8");
}

const EMAIL = "luca@petalflow.app";
const PASSWORD = "PetalFlow2026!";
const FULL_NAME = "Luca R.";

async function main() {
  const env = loadEnv();
  const base = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !serviceKey) throw new Error("Missing Supabase URL or service role key in .env.local");

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  // List users
  const listRes = await fetch(`${base}/auth/v1/admin/users?page=1&per_page=50`, { headers });
  if (!listRes.ok) throw new Error(`List users failed: ${listRes.status} ${await listRes.text()}`);
  const list = await listRes.json();
  let user = list.users?.find((u) => u.email === EMAIL);

  if (!user) {
    const createRes = await fetch(`${base}/auth/v1/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: FULL_NAME },
      }),
    });
    if (!createRes.ok) throw new Error(`Create user failed: ${createRes.status} ${await createRes.text()}`);
    user = await createRes.json();
    console.log("Created auth user:", EMAIL);
  } else {
    console.log("Auth user already exists:", EMAIL);
  }

  setEnvUserId(user.id);
  console.log("PETALFLOW_DEFAULT_USER_ID set in .env.local");
  console.log("Login:", EMAIL, "/", PASSWORD);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
