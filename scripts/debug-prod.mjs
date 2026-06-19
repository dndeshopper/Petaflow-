/**
 * Debug script — tests production PetalFlow API with a YouTube link.
 * Usage: node scripts/debug-prod.mjs
 */

const BASE = process.env.PROD_URL ?? "https://petaflow.vercel.app";
const API_KEY = process.env.INTERNAL_API_KEY ?? "petalflow-prod-2026-xK9mZq7w";
const USER_ID = process.env.PETALFLOW_DEFAULT_USER_ID ?? "37755ebf-531e-4bf0-8146-964fbda508e5";
const TEST_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

async function req(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return { status: res.status, json };
}

async function main() {
  console.log("=== PetalFlow production debug ===");
  console.log("BASE:", BASE);

  const health = await req("/api/health");
  console.log("\n1. Health:", health.status, health.json);

  const create = await req("/api/petals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      url: TEST_URL,
      title: "Debug test video",
      user_id: USER_ID,
    }),
  });
  console.log("\n2. Create petal:", create.status, JSON.stringify(create.json, null, 2));

  const petalId = create.json?.petal?.id;
  if (!petalId) {
    console.error("No petal created — stopping.");
    process.exit(1);
  }

  console.log("\n   preview_url on create:", create.json.petal.preview_url ?? "(null)");
  console.log("   preview_status on create:", create.json.petal.preview_status);

  // Wait for async preview worker
  for (const wait of [2000, 4000, 8000]) {
    await new Promise((r) => setTimeout(r, wait));
    const get = await req(`/api/petals?user_id=${USER_ID}`, {
      headers: { "x-api-key": API_KEY },
    });
    const petal = get.json?.petals?.find((p) => p.id === petalId);
    console.log(`\n3. After ${wait}ms — petal state:`, {
      preview_url: petal?.preview_url ?? "(null)",
      preview_status: petal?.preview_status,
      title: petal?.title,
    });
    if (petal?.preview_url && petal.preview_status === "completed") break;
  }

  // Manual preview process
  const preview = await req("/api/preview/process", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      petalId,
      url: TEST_URL,
      title: "Debug test video",
      platform: "youtube",
    }),
  });
  console.log("\n4. Manual preview/process:", preview.status, preview.json);

  const final = await req(`/api/petals?user_id=${USER_ID}`, {
    headers: { "x-api-key": API_KEY },
  });
  const finalPetal = final.json?.petals?.find((p) => p.id === petalId);
  console.log("\n5. Final petal:", JSON.stringify(finalPetal, null, 2));

  // Check wrong URL dispatch target
  const wrongBase = "https://petalflow.vercel.app";
  const wrongHealth = await req("/api/health").catch(() => null);
  const wrongPreview = await fetch(`${wrongBase}/api/preview/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ petalId, url: TEST_URL, title: "test", platform: "youtube" }),
  }).then(async (r) => ({ status: r.status, body: (await r.text()).slice(0, 200) }));
  console.log("\n6. Wrong URL check (petalflow.vercel.app preview/process):", wrongPreview);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
