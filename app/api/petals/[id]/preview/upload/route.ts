import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { decodeDataUrlImage } from "@/lib/preview/decode-image";
import { savePreviewResult } from "@/lib/preview/store";
import { getYoutubeThumbnailUrl } from "@/lib/preview/youtube";
import { isInternalApiRequest } from "@/lib/petals/resolve-user";
import { uploadPreviewScreenshot } from "@/lib/storage/preview-upload";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const uploadSchema = z.object({
  image: z.string().min(32),
  title: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Upload a screenshot captured by the Chrome extension (visible tab).
 * Requires x-api-key / INTERNAL_API_KEY.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: petalId } = await params;
  const apiKey = request.headers.get("x-api-key");
  const authHeader = request.headers.get("authorization");
  const bearerKey = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!isInternalApiRequest(apiKey ?? bearerKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = uploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const decoded = decodeDataUrlImage(parsed.data.image);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid image data. Use a JPEG/PNG base64 data URL under 4MB." },
        { status: 400 }
      );
    }

    let previewUrl: string | null = null;
    let source: "extension" | "youtube" = "extension";

    if (isSupabaseConfigured()) {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = await createServiceClient();
      const { data: petal } = await supabase
        .from("petals")
        .select("url, platform")
        .eq("id", petalId)
        .maybeSingle();

      const youtubeThumb = petal ? getYoutubeThumbnailUrl(petal.url) : null;
      if (youtubeThumb) {
        previewUrl = youtubeThumb;
        source = "youtube";
      }
    }

    if (!previewUrl) {
      const uploaded = await uploadPreviewScreenshot(petalId, decoded.buffer, {
        suffix: "extension",
        contentType: decoded.contentType,
      });
      previewUrl = uploaded.publicUrl;
    }

    await savePreviewResult(petalId, {
      status: "completed",
      preview_url: previewUrl,
      title: parsed.data.title,
      description: parsed.data.description,
      source,
    });

    return NextResponse.json({
      success: true,
      preview_url: previewUrl,
    });
  } catch (err) {
    console.error("[POST /api/petals/[id]/preview/upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
