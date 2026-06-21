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

/** Canonical permalink for a Facebook post, reel, video, or photo — or null. */
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

    if (path.endsWith("permalink.php") || path.includes("permalink.php")) {
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
    if (fbid && (path.includes("photo") || path.endsWith("photo.php"))) {
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
