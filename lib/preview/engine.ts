import { extractOpenGraph } from "./opengraph";
import type { PreviewJob, PreviewResult } from "./types";
import type { Platform } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { capturePageScreenshot } from "@/lib/playwright";
import {
  bufferToDataUrl,
  uploadPreviewScreenshot,
} from "@/lib/storage/preview-upload";
import { generateAndStoreFallbackCard } from "./generate-fallback";
import { getYoutubeThumbnailUrl } from "./youtube";

/**
 * Preview pipeline:
 * 1. OpenGraph image (title/description enrich metadata)
 * 2. Playwright screenshot → Supabase Storage
 * 3. Branded fallback card → stored image (never broken)
 */
export async function generatePreview(job: PreviewJob): Promise<PreviewResult> {
  const ytThumb =
    job.platform === "youtube" ? getYoutubeThumbnailUrl(job.url) : null;

  const og = await extractOpenGraph(job.url);
  const ogTitle = og.data?.title;
  const ogDescription = og.data?.description;
  const enrichedJob: PreviewJob = {
    ...job,
    title: ogTitle ?? job.title,
  };

  const previewImage = og.success && og.data?.image ? og.data.image : ytThumb;

  if (previewImage) {
    return {
      status: "completed",
      preview_url: previewImage,
      title: enrichedJob.title,
      description: ogDescription,
      source: og.data?.image ? "opengraph" : "youtube",
    };
  }

  const screenshot = await capturePageScreenshot({ url: job.url });

  if (screenshot.success && screenshot.buffer) {
    const previewUrl = await resolveStoredPreviewUrl(
      job.petalId,
      screenshot.buffer
    );

    return {
      status: "completed",
      preview_url: previewUrl,
      title: screenshot.title ?? enrichedJob.title,
      description: ogDescription,
      source: "playwright",
    };
  }

  if (screenshot.error) {
    console.warn(
      `[preview-engine] Playwright failed for ${job.url}:`,
      screenshot.error
    );
  }

  return generateAndStoreFallbackCard(enrichedJob, {
    description: ogDescription,
  });
}

async function resolveStoredPreviewUrl(
  petalId: string,
  buffer: Buffer
): Promise<string> {
  if (isSupabaseConfigured() && petalId) {
    try {
      const uploaded = await uploadPreviewScreenshot(petalId, buffer);
      return uploaded.publicUrl;
    } catch (err) {
      console.error("[preview-engine] Storage upload failed, using data URL:", err);
    }
  }

  return bufferToDataUrl(buffer);
}

export async function runPreviewEngine(
  url: string,
  platform: Platform,
  title: string,
  note?: string | null
): Promise<PreviewResult> {
  return generatePreview({ petalId: "", url, title, note, platform });
}
