import { isSupabaseConfigured } from "@/lib/supabase/client";

const DEFAULT_BUCKET = "petal-previews";

export function getPreviewBucket(): string {
  return process.env.SUPABASE_PREVIEW_BUCKET ?? DEFAULT_BUCKET;
}

export interface UploadPreviewResult {
  publicUrl: string;
  storagePath: string;
}

export interface UploadPreviewOptions {
  suffix?: string;
  contentType?: string;
}

/**
 * Uploads a preview image to Supabase Storage and returns the public URL.
 */
export async function uploadPreviewScreenshot(
  petalId: string,
  buffer: Buffer,
  options?: UploadPreviewOptions
): Promise<UploadPreviewResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for storage uploads");
  }

  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = await createServiceClient();
  const bucket = getPreviewBucket();
  const ext = options?.contentType === "image/png" ? "png" : "jpg";
  const name = options?.suffix
    ? `${Date.now()}-${options.suffix}.${ext}`
    : `${Date.now()}.${ext}`;
  const storagePath = `${petalId}/${name}`;
  const contentType = options?.contentType ?? "image/jpeg";

  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    cacheControl: "31536000",
    upsert: true,
  });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  if (!data.publicUrl) {
    throw new Error("Failed to resolve public URL for preview");
  }

  return { publicUrl: data.publicUrl, storagePath };
}

export function bufferToDataUrl(buffer: Buffer): string {
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}
