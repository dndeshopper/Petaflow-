import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getDemoPetals } from "@/lib/demo-data";
import { isInternalApiRequest } from "@/lib/petals/resolve-user";
import {
  markPreviewFailed,
  savePreviewResult,
} from "@/lib/preview/store";
import type { PreviewResult } from "@/lib/preview/types";
import type { PreviewStatus } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
    const { status, preview_url, title, description, source } = body as {
      status: PreviewStatus;
      preview_url: string | null;
      title?: string;
      description?: string;
      source?: PreviewResult["source"];
    };

    const result: PreviewResult = {
      status,
      preview_url,
      title,
      description,
      source: source ?? "opengraph",
    };

    if (!isSupabaseConfigured()) {
      await savePreviewResult(id, result);
      return NextResponse.json({ success: true, mode: "demo" });
    }

    await savePreviewResult(id, result);
    return NextResponse.json({ success: true });
  } catch (err) {
    try {
      await markPreviewFailed(id);
    } catch {
      // ignore
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const petals = getDemoPetals();
  const petal = petals.find((p) => p.id === id);
  if (!petal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ petal });
}
