import { after } from "next/server";
import { closeBrowser } from "@/lib/playwright/browser";
import { generatePreview } from "./engine";
import { generateAndStoreFallbackCard } from "./generate-fallback";
import { isStoredPreviewUrl } from "./preview-url";
import { isYoutubeClassicThumbnailUrl } from "./youtube";
import {
  markPreviewFailed,
  markPreviewProcessing,
  getPetalPreviewState,
  savePreviewResult,
} from "./store";
import type { PreviewJob } from "./types";

export type { PreviewJob } from "./types";
export { generatePreview, runPreviewEngine } from "./engine";
export { extractOpenGraph } from "./opengraph";

const queue: PreviewJob[] = [];
let draining = false;

function resolveProductionBaseUrl(): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL?.trim(),
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/^https?:\/\//, "")}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    const base = raw.replace(/\/$/, "");
    if (
      base.includes("localhost") ||
      base.includes("127.0.0.1") ||
      base.includes("petalflow.vercel.app")
    ) {
      continue;
    }
    return base;
  }

  return null;
}

function shouldDispatchPreviewWorker(): boolean {
  const baseUrl = resolveProductionBaseUrl();
  const apiKey = process.env.INTERNAL_API_KEY?.trim();
  return Boolean(baseUrl && apiKey);
}

function dispatchPreviewWorker(job: PreviewJob): void {
  const baseUrl = resolveProductionBaseUrl()!;
  const apiKey = process.env.INTERNAL_API_KEY!;

  void fetch(`${baseUrl}/api/preview/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(job),
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Preview worker HTTP ${res.status}: ${body.slice(0, 120)}`);
      }
    })
    .catch((err) => {
      console.error(`[preview-queue] Worker dispatch failed for ${job.petalId}:`, err);
      queue.push(job);
      scheduleDrain();
    });
}

/**
 * Enqueue a preview job. Returns immediately — never blocks petal creation.
 * On Vercel/production, dispatches a separate serverless invocation.
 * Locally, processing runs after the HTTP response via Next.js `after()`.
 */
export function enqueuePreview(job: PreviewJob): void {
  if (shouldDispatchPreviewWorker()) {
    dispatchPreviewWorker(job);
    return;
  }

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
  const existing = await getPetalPreviewState(job.petalId);
  const preserveExistingPreview =
    Boolean(existing?.preview_url) &&
    existing?.preview_status === "completed" &&
    (job.platform === "youtube"
      ? isYoutubeClassicThumbnailUrl(existing.preview_url, job.url)
      : isStoredPreviewUrl(existing.preview_url));

  await markPreviewProcessing(job.petalId);
  const result = await generatePreview({
    ...job,
    preserveExistingPreview,
    existingPreviewUrl: existing?.preview_url ?? null,
  });
  await savePreviewResult(job.petalId, result);
}
