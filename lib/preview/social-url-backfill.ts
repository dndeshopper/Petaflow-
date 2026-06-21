import { after } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { resolvePetalPlatform } from "@/lib/platforms";
import { extractOpenGraph } from "@/lib/preview/opengraph";
import {
  isFacebookPostUrl,
  normalizeFacebookPostUrl,
  pickFacebookPostUrl,
} from "@/lib/url/facebook";
import { isXStatusUrl, normalizeXStatusUrl, pickXPostUrl } from "@/lib/url/x";
import type { Petal, Platform } from "@/lib/types";

const MAX_BACKFILL_PER_REQUEST = 6;
const inFlight = new Set<string>();

export function scheduleSocialUrlBackfill(petals: Petal[]): void {
  if (!isSupabaseConfigured()) return;

  const candidates = petals
    .filter((petal) => needsSocialUrlBackfill(petal))
    .slice(0, MAX_BACKFILL_PER_REQUEST);

  if (candidates.length === 0) return;

  const run = () => {
    void Promise.all(candidates.map((petal) => backfillSocialPostUrl(petal)));
  };

  try {
    after(run);
  } catch {
    setImmediate(run);
  }
}

function needsSocialUrlBackfill(petal: Petal): boolean {
  const platform = resolvePetalPlatform(petal);
  if (platform === "x") return !isXStatusUrl(petal.url);
  if (platform === "facebook") return !isFacebookPostUrl(petal.url);
  return false;
}

function resolveFromOpenGraph(url: string | undefined, platform: Platform): string | null {
  if (!url) return null;
  if (platform === "x") return normalizeXStatusUrl(url);
  if (platform === "facebook") return normalizeFacebookPostUrl(url);
  return null;
}

async function backfillSocialPostUrl(petal: Petal): Promise<void> {
  if (inFlight.has(petal.id)) return;
  inFlight.add(petal.id);

  try {
    const platform = resolvePetalPlatform(petal);
    const og = await extractOpenGraph(petal.url);
    const ogResolved = resolveFromOpenGraph(og.data?.url, platform);
    const localResolved =
      platform === "x"
        ? pickXPostUrl(petal.url)
        : pickFacebookPostUrl(petal.url);
    const resolved = ogResolved ?? localResolved;
    if (!resolved || resolved === petal.url) return;

    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();
    await supabase.from("petals").update({ url: resolved }).eq("id", petal.id);
  } catch (err) {
    console.warn(`[social-url-backfill] Failed for ${petal.id}:`, err);
  } finally {
    inFlight.delete(petal.id);
  }
}
