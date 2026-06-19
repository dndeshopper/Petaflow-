import { NextRequest, NextResponse } from "next/server";
import { runPreviewEngine } from "@/lib/preview/engine";
import { detectPlatform } from "@/lib/platforms";
import { z } from "zod";

const previewSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  note: z.string().optional(),
});

/** Synchronous preview preview (debug / manual). Production flow uses the async queue. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = previewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const { url, title, note } = parsed.data;
    const platform = detectPlatform(url);

    const result = await runPreviewEngine(
      url,
      platform,
      title ?? new URL(url).hostname,
      note
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Preview failed" },
      { status: 500 }
    );
  }
}
