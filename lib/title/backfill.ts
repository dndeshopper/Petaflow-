import { after } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { resolvePetalPlatform } from "@/lib/platforms";
import type { Petal } from "@/lib/types";
import { isWeakTitle } from "./resolve";
import { resolvePetalTitle } from "./resolve";

const MAX_BACKFILL_PER_REQUEST = 5;
const inFlight = new Set<string>();

export function scheduleWeakTitleBackfill(petals: Petal[]): void {
  const weak = petals
    .filter((petal) => {
      const platform = resolvePetalPlatform(petal);
      return isWeakTitle(petal.title, petal.url, platform);
    })
    .slice(0, MAX_BACKFILL_PER_REQUEST);

  if (weak.length === 0) return;

  const run = () => {
    void Promise.all(weak.map((petal) => backfillPetalTitle(petal)));
  };

  try {
    after(run);
  } catch {
    setImmediate(run);
  }
}

async function backfillPetalTitle(petal: Petal): Promise<void> {
  if (inFlight.has(petal.id)) return;
  inFlight.add(petal.id);

  try {
    const platform = resolvePetalPlatform(petal);
    const resolved = await resolvePetalTitle({
      url: petal.url,
      platform,
      currentTitle: petal.title,
    });

    if (
      isWeakTitle(resolved, petal.url, platform) ||
      resolved === petal.title
    ) {
      return;
    }

    if (!isSupabaseConfigured()) {
      const { updateDemoPetalTitle } = await import("@/lib/demo-data");
      updateDemoPetalTitle(petal.id, resolved);
      return;
    }

    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();

    await supabase
      .from("petals")
      .update({ title: resolved })
      .eq("id", petal.id)
      .eq("title", petal.title);
  } catch (err) {
    console.warn(`[title-backfill] Failed for petal ${petal.id}:`, err);
  } finally {
    inFlight.delete(petal.id);
  }
}
