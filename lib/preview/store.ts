import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  saveDemoPreviewResult,
  setDemoPetalPreviewStatus,
} from "@/lib/demo-data";
import type { PreviewResult } from "./types";

export async function markPreviewProcessing(petalId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    setDemoPetalPreviewStatus(petalId, "processing");
    return;
  }

  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = await createServiceClient();

  await supabase
    .from("petals")
    .update({ preview_status: "processing" })
    .eq("id", petalId);
}

export async function savePreviewResult(
  petalId: string,
  result: PreviewResult
): Promise<void> {
  if (!isSupabaseConfigured()) {
    saveDemoPreviewResult(petalId, result);
    return;
  }

  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = await createServiceClient();

  const petalUpdate: Record<string, string | null> = {
    preview_status: result.status,
    preview_url: result.preview_url,
    description: result.description ?? null,
  };

  if (result.title) {
    petalUpdate.title = result.title;
  }

  const { error: petalError } = await supabase
    .from("petals")
    .update(petalUpdate)
    .eq("id", petalId);

  if (petalError) {
    throw new Error(petalError.message);
  }

  if (result.preview_url) {
    const { error: previewError } = await supabase.from("petal_previews").insert({
      petal_id: petalId,
      image_url: result.preview_url,
      title: result.title ?? null,
      description: result.description ?? null,
      source: result.source,
    });

    if (previewError) {
      throw new Error(previewError.message);
    }
  } else if (result.status === "completed" || result.status === "fallback") {
    throw new Error("Preview result must include preview_url");
  }
}

export async function markPreviewFailed(petalId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    setDemoPetalPreviewStatus(petalId, "failed");
    return;
  }

  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = await createServiceClient();

  await supabase
    .from("petals")
    .update({ preview_status: "failed" })
    .eq("id", petalId);
}
