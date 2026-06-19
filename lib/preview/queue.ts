import { after } from "next/server";
import { closeBrowser } from "@/lib/playwright/browser";
import { generatePreview } from "./engine";
import { generateAndStoreFallbackCard } from "./generate-fallback";
import {
  markPreviewFailed,
  markPreviewProcessing,
  savePreviewResult,
} from "./store";
import type { PreviewJob } from "./types";

export type { PreviewJob } from "./types";
export { generatePreview, runPreviewEngine } from "./engine";
export { extractOpenGraph } from "./opengraph";

const queue: PreviewJob[] = [];
let draining = false;

/**
 * Enqueue a preview job. Returns immediately — never blocks petal creation.
 * Processing runs after the HTTP response via Next.js `after()`.
 */
export function enqueuePreview(job: PreviewJob): void {
  queue.push(job);
  scheduleDrain();
}

function scheduleDrain(): void {
  try {
    after(async () => {
      await drainQueue();
    });
  } catch {
    setImmediate(() => {
      void drainQueue();
    });
  }
}

async function drainQueue(): Promise<void> {
  if (draining) return;
  draining = true;

  while (queue.length > 0) {
    const job = queue.shift()!;
    try {
      await processPreviewJob(job);
    } catch (err) {
      console.error(`[preview-queue] Job failed for petal ${job.petalId}:`, err);
      try {
        const fallback = await generateAndStoreFallbackCard(job);
        await savePreviewResult(job.petalId, fallback);
      } catch (fallbackErr) {
        console.error(
          `[preview-queue] Fallback generation failed for petal ${job.petalId}:`,
          fallbackErr
        );
        try {
          await markPreviewFailed(job.petalId);
        } catch {
          // best-effort
        }
      }
    }
  }

  draining = false;

  await closeBrowser().catch(() => undefined);
}

export async function processPreviewJob(job: PreviewJob): Promise<void> {
  await markPreviewProcessing(job.petalId);
  const result = await generatePreview(job);
  await savePreviewResult(job.petalId, result);
}
