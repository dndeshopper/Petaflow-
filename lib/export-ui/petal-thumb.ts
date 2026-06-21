import type { Platform } from "@/lib/types";

/** Shared thumbnail proportions (YouTube-style card layout). */
export const PETAL_CARD_THUMB = {
  dashboard: { width: 96, height: 62 },
  timeline: { width: 80, height: 54 },
  search: { width: 88, height: 56 },
  inbox: { width: 96, height: 60 },
} as const;

export function petalShowsThumb(item: {
  platformId: Platform;
  thumbImageUrl: string | null;
  thumbLabel: string;
}): boolean {
  if (item.platformId === "x" || item.platformId === "youtube") return true;
  return Boolean(item.thumbImageUrl || item.thumbLabel);
}
