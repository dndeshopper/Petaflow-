import type { Platform, PreviewStatus } from "@/lib/types";

export interface PreviewJob {
  petalId: string;
  url: string;
  title: string;
  note?: string | null;
  platform?: Platform;
  preserveExistingPreview?: boolean;
  existingPreviewUrl?: string | null;
}

export interface OpenGraphMetadata {
  title?: string;
  image?: string;
  description?: string;
}

export interface PreviewResult {
  status: PreviewStatus;
  preview_url: string | null;
  title?: string;
  description?: string;
  source: "opengraph" | "playwright" | "fallback" | "youtube" | "extension";
}
