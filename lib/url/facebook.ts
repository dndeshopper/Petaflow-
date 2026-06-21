const FB_HOSTS = new Set([
  "facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "fb.com",
  "fb.watch",
  "fb.me",
]);

const FB_SKIP_FIRST_SEGMENTS = new Set([
  "photo",
  "watch",
  "reel",
  "videos",
  "groups",
  "people",
  "events",
  "marketplace",
  "gaming",
  "login",
  "share",
]);

export function isFacebookHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return FB_HOSTS.has(host) || host.endsWith(".facebook.com");
  } catch {
    return false;
  }
}

/** Unwrap l.facebook.com / lm.facebook.com redirect wrappers. */
export function unwrapFacebookRedirectUrl(url: string): string {
  try {
    let current = url;
    for (let i = 0; i < 4; i++) {
      const parsed = new URL(current);
      const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
      if (host === "l.facebook.com" || host === "lm.facebook.com") {
        const next = parsed.searchParams.get("u");
        if (!next) break;
        current = decodeURIComponent(next);
        continue;
      }
      break;
    }
    return current;
  } catch {
    return url;
  }
}

/** True for feed/home URLs that are not a specific post permalink. */
export function isGenericFacebookUrl(url: string): boolean {
  if (!isFacebookHost(url)) return false;
  if (isFacebookPostUrl(url)) return false;

  try {
    const parsed = new URL(unwrapFacebookRedirectUrl(url));
    const path = parsed.pathname.replace(/\/$/, "") || "/";
    if (path === "/" || path === "/home.php" || path === "/index.php") return true;
    if (path === "/watch" && !parsed.searchParams.get("v")) return true;
    return !normalizeFacebookPostUrl(url);
  } catch {
    return true;
  }
}

/** Canonical permalink for a Facebook post, reel, video, or photo — or null. */
export function normalizeFacebookPostUrl(url: string): string | null {
  try {
    const unwrapped = unwrapFacebookRedirectUrl(url);
    const parsed = new URL(unwrapped);
    if (!isFacebookHost(parsed.href)) return null;

    if (parsed.hostname.replace(/^www\./, "") === "fb.watch") {
      return parsed.href.split("#")[0];
    }

    const canonicalHost = "www.facebook.com";
    const path = parsed.pathname;

    const groupPermalink = path.match(/^\/groups\/([^/]+)\/permalink\/([^/?#]+)/);
    if (groupPermalink) {
      return `https://${canonicalHost}/groups/${groupPermalink[1]}/permalink/${groupPermalink[2]}/`;
    }

    const groupPost = path.match(/^\/groups\/([^/]+)\/posts\/([^/?#]+)/);
    if (groupPost) {
      return `https://${canonicalHost}/groups/${groupPost[1]}/posts/${groupPost[2]}`;
    }

    const postsMatch = path.match(/^\/([^/]+)\/posts\/([^/?#]+)/);
    if (postsMatch && !FB_SKIP_FIRST_SEGMENTS.has(postsMatch[1])) {
      return `https://${canonicalHost}/${postsMatch[1]}/posts/${postsMatch[2]}`;
    }

    const peoplePost = path.match(/^(\/people\/[^/]+\/[^/]+)\/posts\/([^/?#]+)/);
    if (peoplePost) {
      return `https://${canonicalHost}${peoplePost[1]}/posts/${peoplePost[2]}`;
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
      const params = new URLSearchParams({ fbid });
      const set = parsed.searchParams.get("set");
      if (set) params.set("set", set);
      return `https://${canonicalHost}/photo/?${params.toString()}`;
    }

    return null;
  } catch {
    return null;
  }
}

export function isFacebookPostUrl(url: string): boolean {
  return normalizeFacebookPostUrl(url) !== null;
}

export function pickFacebookPostUrl(
  ...candidates: (string | null | undefined)[]
): string | null {
  for (const raw of candidates) {
    if (!raw) continue;
    const normalized = normalizeFacebookPostUrl(raw);
    if (normalized) return normalized;
  }
  return null;
}
