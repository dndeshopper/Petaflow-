/** Returns true for http(s) URLs we can save as petals. */
export function isSavableUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Stream/CDN URLs are not useful petal links. */
export function isDirectMediaUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.startsWith("blob:") ||
    lower.includes("googlevideo.com") ||
    lower.includes("ytimg.com/vi/") ||
    lower.includes("/videoplayback") ||
    lower.includes("/manifest")
  );
}

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

export function normalizeYoutubeUrl(url: string): string {
  const id = extractYoutubeVideoId(url);
  if (!id) return url;
  return `https://www.youtube.com/watch?v=${id}`;
}

export function isYoutubeUrl(url: string): boolean {
  return extractYoutubeVideoId(url) !== null;
}

const X_HOSTS = new Set(["x.com", "twitter.com", "mobile.x.com", "mobile.twitter.com"]);

export function normalizeXStatusUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (!X_HOSTS.has(host)) return null;

    const webStatus = parsed.pathname.match(/^\/i\/web\/status\/(\d+)/);
    if (webStatus) {
      return `https://x.com/i/web/status/${webStatus[1]}`;
    }

    const match = parsed.pathname.match(/^\/([^/?#]+)\/status\/(\d+)/);
    if (!match) return null;

    const [, user, statusId] = match;
    if (user === "i") return null;

    return `https://x.com/${user}/status/${statusId}`;
  } catch {
    return null;
  }
}

export function pickXPostUrl(...candidates: (string | null | undefined)[]): string | null {
  for (const raw of candidates) {
    if (!raw) continue;
    const normalized = normalizeXStatusUrl(raw);
    if (normalized) return normalized;
  }
  return null;
}

import {
  isFacebookHost,
  isGenericFacebookUrl,
  normalizeFacebookPostUrl,
  pickFacebookPostUrl,
  unwrapFacebookRedirectUrl,
} from "./facebook-url";

export {
  isFacebookHost,
  isGenericFacebookUrl,
  normalizeFacebookPostUrl,
  pickFacebookPostUrl,
  unwrapFacebookRedirectUrl,
};

export function pickSocialPostUrl(...candidates: (string | null | undefined)[]): string | null {
  return pickXPostUrl(...candidates) ?? pickFacebookPostUrl(...candidates);
}

export function pickBestCaptureUrl(...candidates: (string | null | undefined)[]): string | null {
  const socialPost = pickSocialPostUrl(...candidates);
  if (socialPost) return socialPost;

  for (const raw of candidates) {
    if (!raw) continue;
    if (!isSavableUrl(raw) || isDirectMediaUrl(raw)) continue;
    if (isYoutubeUrl(raw)) return normalizeYoutubeUrl(raw);
    return raw;
  }

  for (const raw of candidates) {
    if (!raw || !isSavableUrl(raw)) continue;
    if (isYoutubeUrl(raw)) return normalizeYoutubeUrl(raw);
  }

  return null;
}

/**
 * Pick the best URL to save from context-menu click data.
 * On video players, prefer the page URL over the stream srcUrl.
 */
export function pickCaptureUrl(options: {
  linkUrl?: string;
  pageUrl?: string;
  srcUrl?: string;
  tabUrl?: string;
}): string | null {
  return pickBestCaptureUrl(
    options.linkUrl,
    options.pageUrl,
    options.tabUrl,
    options.srcUrl
  );
}
