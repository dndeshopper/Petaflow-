import { after } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { resolvePetalPlatform } from "@/lib/platforms";
import { extractOpenGraph } from "@/lib/preview/opengraph";
import { isXStatusUrl, normalizeXStatusUrl } from "@/lib/url/x";
import type { Petal } from "@/lib/types";

const MAX_BACKFILL_PER_REQUEST = 5;
const inFlight = new Set<string>();

export function scheduleXUrlBackfill(petals: Petal[]): void {
  if (!isSupabaseConfigured()) return;

  const candidates = petals
    .filter((petal) => {
      if (resolvePetalPlatform(petal) !== "x") return false;
      return !isXStatusUrl(petal.url);
    })
    .slice(0, MAX_BACKFILL_PER_REQUEST);

  if (candidates.length === 0) return;

  const run = () => {
    void Promise.all(candidates.map((petal) => backfillXPostUrl(petal)));
  };

  try {
    after(run);
  } catch {
    setImmediate(run);
  }
}

async function backfillXPostUrl(petal: Petal): Promise<void> {
  if (inFlight.has(petal.id)) return;
  inFlight.add(petal.id);

  try {
    const og = await extractOpenGraph(petal.url);
    const ogUrl = og.data?.url ? normalizeXStatusUrl(og.data.url) : null;
    const fromCurrent = normalizeXStatusUrl(petal.url);
    const resolved = ogUrl ?? fromCurrent;
    if (!resolved || resolved === petal.url) return;

    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();
    await supabase.from("petals").update({ url: resolved }).eq("id", petal.id);
  } catch (err) {
    console.warn(`[x-url-backfill] Failed for ${petal.id}:`, err);
  } finally {
    inFlight.delete(petal.id);
  }
}
