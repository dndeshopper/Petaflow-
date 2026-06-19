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
 * Preview pipeline (screenshot-first for all platforms):
 * 1. Playwright / serverless Chromium screenshot → Supabase Storage
 * 2. YouTube thumbnail or OpenGraph image
 * 3. Branded fallback card
 *
 * OpenGraph is always used to enrich title/description when available.
 */
export async function generatePreview(job: PreviewJob): Promise<PreviewResult> {
  const og = await extractOpenGraph(job.url);
  const ogTitle = og.data?.title;
  const ogDescription = og.data?.description;
  const enrichedJob: PreviewJob = {
    ...job,
    title: ogTitle ?? job.title,
  };

  if (job.preserveExistingPreview && job.existingPreviewUrl) {
    return {
      status: "completed",
      preview_url: job.existingPreviewUrl,
      title: enrichedJob.title,
      description: ogDescription,
      source: "extension",
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
      `[preview-engine] Screenshot failed for ${job.url}:`,
      screenshot.error
    );
  }

  const ytThumb =
    job.platform === "youtube" ? getYoutubeThumbnailUrl(job.url) : null;
  const previewImage = ytThumb ?? (og.success ? og.data?.image : undefined);

  if (previewImage) {
    return {
      status: "completed",
      preview_url: previewImage,
      title: enrichedJob.title,
      description: ogDescription,
      source: ytThumb ? "youtube" : "opengraph",
    };
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
