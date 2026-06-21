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

const FB_HOSTS = new Set([
  "facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "fb.com",
  "fb.watch",
  "fb.me",
]);

export function isFacebookHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return FB_HOSTS.has(host) || host.endsWith(".facebook.com");
  } catch {
    return false;
  }
}

export function normalizeFacebookPostUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!isFacebookHost(parsed.href)) return null;

    if (parsed.hostname.replace(/^www\./, "") === "fb.watch") {
      return parsed.href.split("#")[0];
    }

    const canonicalHost = "www.facebook.com";
    const path = parsed.pathname;

    const groupPost = path.match(/^\/groups\/([^/]+)\/posts\/([^/?#]+)/);
    if (groupPost) {
      return `https://${canonicalHost}/groups/${groupPost[1]}/posts/${groupPost[2]}`;
    }

    const postsMatch = path.match(/^\/([^/]+)\/posts\/([^/?#]+)/);
    if (
      postsMatch &&
      !["photo", "watch", "reel", "videos", "groups"].includes(postsMatch[1])
    ) {
      return `https://${canonicalHost}/${postsMatch[1]}/posts/${postsMatch[2]}`;
    }

    const reel = path.match(/^\/reel\/([^/?#]+)/);
    if (reel) return `https://${canonicalHost}/reel/${reel[1]}`;

    if (path.startsWith("/watch")) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://${canonicalHost}/watch/?v=${v}`;
    }

    const videoPath = path.match(/^\/([^/]+)\/videos\/([^/?#]+)/);
    if (videoPath && videoPath[1] !== "watch") {
      return `https://${canonicalHost}/${videoPath[1]}/videos/${videoPath[2]}`;
    }

    const videosRoot = path.match(/^\/videos\/([^/?#]+)/);
    if (videosRoot) {
      return `https://${canonicalHost}/videos/${videosRoot[1]}`;
    }

    if (path.includes("permalink.php")) {
      const storyFbid = parsed.searchParams.get("story_fbid");
      const id = parsed.searchParams.get("id");
      if (storyFbid && id) {
        return `https://${canonicalHost}/permalink.php?story_fbid=${storyFbid}&id=${id}`;
      }
    }

    if (path.includes("story.php")) {
      const storyFbid = parsed.searchParams.get("story_fbid");
      const id = parsed.searchParams.get("id");
      if (storyFbid) {
        const params = new URLSearchParams({ story_fbid: storyFbid });
        if (id) params.set("id", id);
        return `https://${canonicalHost}/story.php?${params.toString()}`;
      }
    }

    const fbid = parsed.searchParams.get("fbid");
    if (fbid && path.includes("photo")) {
      const set = parsed.searchParams.get("set");
      const params = new URLSearchParams({ fbid });
      if (set) params.set("set", set);
      return `https://${canonicalHost}/photo/?${params.toString()}`;
    }

    return null;
  } catch {
    return null;
  }
}

export function pickFacebookPostUrl(...candidates: (string | null | undefined)[]): string | null {
  for (const raw of candidates) {
    if (!raw) continue;
    const normalized = normalizeFacebookPostUrl(raw);
    if (normalized) return normalized;
  }
  return null;
}

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
