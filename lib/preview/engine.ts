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
import { getYoutubeThumbnailUrl, isYoutubeClassicThumbnailUrl } from "./youtube";
import { pickBetterTitle, resolvePetalTitle } from "@/lib/title/resolve";

async function buildYoutubePreviewResult(
  job: PreviewJob,
  ogDescription: string | undefined,
  finalizeTitle: (extra?: string | null) => Promise<string>
): Promise<PreviewResult | null> {
  const ytThumb = getYoutubeThumbnailUrl(job.url);
  if (!ytThumb) return null;

  return {
    status: "completed",
    preview_url: ytThumb,
    title: await finalizeTitle(),
    description: ogDescription,
    source: "youtube",
  };
}

/**
 * Preview pipeline:
 * - YouTube: always use the classic video thumbnail (img.youtube.com)
 * - Other platforms: screenshot → OpenGraph → fallback card
 *
 * OpenGraph is always used to enrich title/description when available.
 */
export async function generatePreview(job: PreviewJob): Promise<PreviewResult> {
  const og = await extractOpenGraph(job.url);
  const ogTitle = og.data?.title;
  const ogDescription = og.data?.description;
  const seedTitle = pickBetterTitle(job.title, ogTitle, job.url, job.platform);

  async function finalizeTitle(extra?: string | null): Promise<string> {
    return resolvePetalTitle({
      url: job.url,
      platform: job.platform,
      currentTitle: pickBetterTitle(seedTitle, extra, job.url, job.platform),
      skipOpenGraph: true,
    });
  }

  if (job.platform === "youtube") {
    const youtubeResult = await buildYoutubePreviewResult(
      job,
      ogDescription,
      finalizeTitle
    );
    if (youtubeResult) return youtubeResult;
  }

  const preserveExtensionPreview =
    job.preserveExistingPreview &&
    job.existingPreviewUrl &&
    (job.platform === "youtube"
      ? isYoutubeClassicThumbnailUrl(job.existingPreviewUrl, job.url)
      : true);

  if (preserveExtensionPreview && job.existingPreviewUrl) {
    return {
      status: "completed",
      preview_url: job.existingPreviewUrl,
      title: await finalizeTitle(),
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
      title: await finalizeTitle(screenshot.title),
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
      title: await finalizeTitle(screenshot.title),
      description: ogDescription,
      source: ytThumb ? "youtube" : "opengraph",
    };
  }

  const enrichedJob: PreviewJob = {
    ...job,
    title: await finalizeTitle(screenshot.title),
  };

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
