import { extractYoutubeVideoId } from "./url-utils";

function cleanYoutubeSuffix(title: string): string {
  return title.replace(/\s*-\s*YouTube\s*$/i, "").trim();
}

export function isWeakSavedTitle(title: string, url: string): boolean {
  const cleaned = cleanYoutubeSuffix(title.trim());
  if (!cleaned || cleaned.length < 2 || cleaned === "-") return true;
  if (/^youtube$/i.test(cleaned)) return true;

  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (cleaned === host || cleaned === url) return true;
  } catch {
    if (cleaned === url) return true;
  }

  if (extractYoutubeVideoId(url) && /^-?\s*(youtube)?$/i.test(cleaned)) {
    return true;
  }

  return false;
}

export async function resolveTitleBeforeSave(
  url: string,
  title: string
): Promise<string> {
  const trimmed = title.trim();
  if (!isWeakSavedTitle(trimmed, url)) {
    return cleanYoutubeSuffix(trimmed);
  }

  const videoId = extractYoutubeVideoId(url);
  if (!videoId) return trimmed || url;

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as { title?: string };
      if (data.title?.trim()) {
        return data.title.trim();
      }
    }
  } catch {
    // fall through
  }

  return trimmed || url;
}
