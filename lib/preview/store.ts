import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  saveDemoPreviewResult,
  setDemoPetalPreviewStatus,
} from "@/lib/demo-data";
import type { PreviewResult } from "./types";
import type { Platform, PreviewStatus } from "@/lib/types";
import { pickBetterTitle, resolvePetalTitle, isWeakTitle } from "@/lib/title/resolve";

export async function getPetalPreviewState(
  petalId: string
): Promise<{
  preview_url: string | null;
  preview_status: PreviewStatus;
} | null> {
  if (!isSupabaseConfigured()) {
    const { getDemoPetals } = await import("@/lib/demo-data");
    const petal = getDemoPetals().find((p) => p.id === petalId);
    if (!petal) return null;
    return {
      preview_url: petal.preview_url,
      preview_status: petal.preview_status,
    };
  }

  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("petals")
    .select("preview_url, preview_status")
    .eq("id", petalId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

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

  const { data: existing } = await supabase
    .from("petals")
    .select("title, url, platform")
    .eq("id", petalId)
    .maybeSingle();

  let resolvedTitle = result.title;
  if (existing) {
    const platform = existing.platform as Platform;
    const merged = pickBetterTitle(
      existing.title,
      result.title,
      existing.url,
      platform
    );
    resolvedTitle = await resolvePetalTitle({
      url: existing.url,
      platform,
      currentTitle: merged,
      skipOpenGraph: Boolean(result.title) && !isWeakTitle(merged, existing.url, platform),
    });
  }

  const petalUpdate: Record<string, string | null> = {
    preview_status: result.status,
    preview_url: result.preview_url,
    description: result.description ?? null,
  };

  if (resolvedTitle) {
    petalUpdate.title = resolvedTitle;
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
