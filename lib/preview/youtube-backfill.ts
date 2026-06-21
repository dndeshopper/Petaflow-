import { after } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { resolvePetalPlatform } from "@/lib/platforms";
import type { Petal } from "@/lib/types";
import {
  getYoutubeThumbnailUrl,
  youtubePreviewNeedsFix,
} from "@/lib/preview/youtube";

const MAX_BACKFILL_PER_REQUEST = 8;
const inFlight = new Set<string>();

export function scheduleYoutubePreviewBackfill(petals: Petal[]): void {
  const candidates = petals
    .filter((petal) => {
      const platform = resolvePetalPlatform(petal);
      if (platform !== "youtube") return false;
      return youtubePreviewNeedsFix(petal.url, petal.preview_url);
    })
    .slice(0, MAX_BACKFILL_PER_REQUEST);

  if (candidates.length === 0) return;

  const run = () => {
    void Promise.all(candidates.map((petal) => backfillYoutubePreview(petal)));
  };

  try {
    after(run);
  } catch {
    setImmediate(run);
  }
}

async function backfillYoutubePreview(petal: Petal): Promise<void> {
  if (inFlight.has(petal.id)) return;
  inFlight.add(petal.id);

  try {
    const classic = getYoutubeThumbnailUrl(petal.url);
    if (!classic || classic === petal.preview_url) return;

    if (!isSupabaseConfigured()) {
      const { updateDemoPetalPreview } = await import("@/lib/demo-data");
      updateDemoPetalPreview(petal.id, classic);
      return;
    }

    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();

    await supabase
      .from("petals")
      .update({
        preview_url: classic,
        preview_status: "completed",
      })
      .eq("id", petal.id);
  } catch (err) {
    console.warn(`[youtube-preview-backfill] Failed for ${petal.id}:`, err);
  } finally {
    inFlight.delete(petal.id);
  }
}
