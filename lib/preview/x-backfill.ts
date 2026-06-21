import { after } from "next/server";
import { resolvePetalPlatform } from "@/lib/platforms";
import { enqueuePreview } from "@/lib/preview/queue";
import type { Petal } from "@/lib/types";

const MAX_BACKFILL_PER_REQUEST = 5;
const inFlight = new Set<string>();

export function scheduleXPreviewBackfill(petals: Petal[]): void {
  const missing = petals
    .filter(
      (petal) =>
        resolvePetalPlatform(petal) === "x" &&
        !petal.preview_url &&
        petal.preview_status !== "processing"
    )
    .slice(0, MAX_BACKFILL_PER_REQUEST);

  if (missing.length === 0) return;

  const run = () => {
    void Promise.all(missing.map((petal) => enqueueXPreview(petal)));
  };

  try {
    after(run);
  } catch {
    setImmediate(run);
  }
}

function enqueueXPreview(petal: Petal): void {
  if (inFlight.has(petal.id)) return;
  inFlight.add(petal.id);

  try {
    enqueuePreview({
      petalId: petal.id,
      url: petal.url,
      title: petal.title,
      note: petal.note,
      platform: "x",
    });
  } catch (err) {
    console.warn(`[x-preview-backfill] Failed for ${petal.id}:`, err);
  } finally {
    inFlight.delete(petal.id);
  }
}
