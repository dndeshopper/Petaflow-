import { NextRequest, NextResponse } from "next/server";
import { processPreviewJob } from "@/lib/preview/queue";
import { isInternalApiRequest } from "@/lib/petals/resolve-user";
import { detectPlatform } from "@/lib/platforms";
import type { Platform } from "@/lib/types";
import { z } from "zod";

const processSchema = z.object({
  petalId: z.string().min(1),
  url: z.string().url(),
  title: z.string(),
  note: z.string().nullable().optional(),
  platform: z
    .enum([
      "youtube",
      "instagram",
      "tiktok",
      "x",
      "linkedin",
      "medium",
      "website",
    ])
    .optional(),
});

/**
 * Internal worker endpoint for async preview generation.
 * Protected by x-api-key / INTERNAL_API_KEY.
 */
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!isInternalApiRequest(apiKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = processSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { petalId, url, title, note, platform: platformInput } = parsed.data;
    const platform: Platform = platformInput ?? detectPlatform(url);

    await processPreviewJob({
      petalId,
      url,
      title,
      note,
      platform,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/preview/process]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Preview processing failed" },
      { status: 500 }
    );
  }
}
