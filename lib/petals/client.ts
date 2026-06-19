import type { CreatePetalInput, Petal } from "@/lib/types";
import { detectPlatform } from "@/lib/platforms";
import { getYoutubeThumbnailUrl } from "@/lib/preview/youtube";

export function createOptimisticPetal(
  input: CreatePetalInput,
  userId: string
): Petal {
  const platform = input.platform ?? detectPlatform(input.url);
  const youtubeThumb =
    platform === "youtube" ? getYoutubeThumbnailUrl(input.url) : null;
  let title = input.title;
  if (!title) {
    try {
      title = new URL(input.url).hostname;
    } catch {
      title = input.url;
    }
  }

  return {
    id: `optimistic-${crypto.randomUUID()}`,
    user_id: userId,
    url: input.url,
    title,
    note: input.note ?? null,
    platform,
    preview_url: youtubeThumb,
    created_at: new Date().toISOString(),
    viewed: false,
    status: "inbox",
    theme: input.theme ?? null,
    preview_status: youtubeThumb ? "completed" : "pending",
  };
}

export async function fetchPetals(): Promise<Petal[]> {
  const res = await fetch("/api/petals", { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to load petals");
  }
  const data = await res.json();
  return data.petals ?? [];
}

export async function createPetalRequest(
  input: CreatePetalInput
): Promise<Petal> {
  const res = await fetch("/api/petals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create petal");
  }

  const data = await res.json();
  return data.petal;
}
