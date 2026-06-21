/** Extract YouTube video ID from common URL formats. */
export function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id && id.length === 11 ? id : null;
    }

    if (host.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v && v.length === 11) return v;

      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx !== -1 && parts[embedIdx + 1]?.length === 11) {
        return parts[embedIdx + 1];
      }
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx !== -1 && parts[shortsIdx + 1]?.length === 11) {
        return parts[shortsIdx + 1];
      }
    }
  } catch {
    // invalid URL
  }

  const fallback = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  );
  return fallback?.[1] ?? null;
}

const YOUTUBE_THUMB_HOST = "img.youtube.com";

/** Classic YouTube video thumbnail (480×360, always available). */
export function getYoutubeThumbnailUrl(url: string): string | null {
  const id = extractYoutubeVideoId(url);
  if (!id) return null;
  return `https://${YOUTUBE_THUMB_HOST}/vi/${id}/hqdefault.jpg`;
}

export function isYoutubeClassicThumbnailUrl(
  previewUrl: string | null | undefined,
  videoUrl?: string
): boolean {
  if (!previewUrl?.includes(YOUTUBE_THUMB_HOST)) return false;
  if (!videoUrl) return true;
  const id = extractYoutubeVideoId(videoUrl);
  return id ? previewUrl.includes(`/vi/${id}/`) : true;
}

export function youtubePreviewNeedsFix(
  videoUrl: string,
  previewUrl: string | null | undefined
): boolean {
  const classic = getYoutubeThumbnailUrl(videoUrl);
  if (!classic) return false;
  return !isYoutubeClassicThumbnailUrl(previewUrl, videoUrl);
}
