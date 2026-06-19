import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  bufferToDataUrl,
  uploadPreviewScreenshot,
} from "@/lib/storage/preview-upload";
import { detectPlatform } from "@/lib/platforms";
import type { PreviewJob, PreviewResult } from "./types";
import { generateBrandedFallbackSvg, svgToDataUrl } from "./fallback-card";
import { rasterizeFallbackSvg } from "./render-fallback";

/**
 * Generates a branded fallback card image, stores it, and returns a preview result.
 * Guaranteed to return a non-null preview_url.
 */
export async function generateAndStoreFallbackCard(
  job: PreviewJob,
  options?: { description?: string | null }
): Promise<PreviewResult> {
  const platform = job.platform ?? detectPlatform(job.url);
  const note = job.note ?? options?.description ?? null;
  const title = job.title.trim() || platform;

  let previewUrl: string;

  try {
    const svg = generateBrandedFallbackSvg({ platform, title, note });
    const buffer = await rasterizeFallbackSvg(svg);
    previewUrl = await resolveStoredPreviewUrl(job.petalId, buffer);
  } catch (err) {
    console.error("[fallback-card] Rasterize/upload failed, using SVG data URL:", err);
    const svg = generateBrandedFallbackSvg({ platform, title, note });
    previewUrl = svgToDataUrl(svg);
  }

  return {
    status: "fallback",
    preview_url: previewUrl,
    title,
    description: note ?? undefined,
    source: "fallback",
  };
}

async function resolveStoredPreviewUrl(
  petalId: string,
  buffer: Buffer
): Promise<string> {
  if (isSupabaseConfigured() && petalId) {
    const uploaded = await uploadPreviewScreenshot(petalId, buffer, {
      suffix: "fallback",
    });
    return uploaded.publicUrl;
  }

  return bufferToDataUrl(buffer);
}
