const X_HOSTS = new Set(["x.com", "twitter.com", "mobile.x.com", "mobile.twitter.com"]);

export function isXHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return X_HOSTS.has(host);
  } catch {
    return false;
  }
}

/** Canonical permalink for an X/Twitter status, or null if not a post URL. */
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

export function isXStatusUrl(url: string): boolean {
  return normalizeXStatusUrl(url) !== null;
}

/** Prefer a status permalink over a generic X page URL. */
export function pickXPostUrl(...candidates: (string | null | undefined)[]): string | null {
  for (const raw of candidates) {
    if (!raw) continue;
    const normalized = normalizeXStatusUrl(raw);
    if (normalized) return normalized;
  }
  return null;
}

export { resolvePetalOpenUrl, normalizePetalSaveUrl } from "@/lib/url/petal-url";
