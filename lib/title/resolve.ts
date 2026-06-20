import { extractOpenGraph } from "@/lib/preview/opengraph";
import { extractYoutubeVideoId } from "@/lib/preview/youtube";
import { detectPlatform } from "@/lib/platforms";
import type { Platform } from "@/lib/types";

const FETCH_TIMEOUT_MS = 8_000;

const PLATFORM_ONLY = /^(youtube|facebook|instagram|tiktok|x|twitter)$/i;

/** Remove trailing site-name suffixes from page titles. */
export function cleanTitle(raw: string, platform?: Platform): string {
  let title = raw.trim();
  if (!title) return title;

  const suffixPatterns = [
    /\s*[-–—|]\s*YouTube\s*$/i,
    /\s*[-–—|]\s*Facebook\s*$/i,
    /\s*[-–—|]\s*Instagram\s*$/i,
    /\s*[-–—|]\s*TikTok\s*$/i,
    /\s*\/\s*X\s*$/i,
  ];

  for (const pattern of suffixPatterns) {
    title = title.replace(pattern, "").trim();
  }

  if (platform === "youtube") {
    title = title.replace(/^-\s*$/, "").trim();
  }

  return title;
}

export function isWeakTitle(
  title: string | undefined | null,
  url: string,
  platform?: Platform
): boolean {
  if (!title?.trim()) return true;

  const plat = platform ?? detectPlatform(url);
  const cleaned = cleanTitle(title, plat);

  if (!cleaned || cleaned.length < 2) return true;
  if (cleaned === "-") return true;
  if (PLATFORM_ONLY.test(cleaned)) return true;

  if (plat === "youtube" && /^-?\s*(youtube)?$/i.test(cleaned)) return true;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (cleaned === host || cleaned === parsed.hostname || cleaned === url) {
      return true;
    }
  } catch {
    if (cleaned === url) return true;
  }

  return false;
}

function titleQuality(
  title: string,
  url: string,
  platform?: Platform
): number {
  if (isWeakTitle(title, url, platform)) return 0;
  const cleaned = cleanTitle(title, platform);
  let score = Math.min(cleaned.length, 200);
  if (platform === "youtube" && cleaned.includes(" ")) score += 50;
  return score;
}

export function pickBetterTitle(
  current: string | undefined | null,
  candidate: string | undefined | null,
  url: string,
  platform?: Platform
): string {
  const plat = platform ?? detectPlatform(url);
  const cur = current?.trim() ? cleanTitle(current, plat) : "";
  const cand = candidate?.trim() ? cleanTitle(candidate, plat) : "";

  if (isWeakTitle(cur, url, plat) && !isWeakTitle(cand, url, plat)) {
    return cand;
  }
  if (isWeakTitle(cand, url, plat)) {
    return cur || cand || fallbackTitle(url);
  }

  return titleQuality(cand, url, plat) > titleQuality(cur, url, plat)
    ? cand
    : cur;
}

function fallbackTitle(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit
): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchYoutubeTitle(url: string): Promise<string | null> {
  const id = extractYoutubeVideoId(url);
  if (!id) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;

  const res = await fetchWithTimeout(endpoint, {
    headers: { Accept: "application/json" },
  });
  if (!res?.ok) return null;

  try {
    const data = (await res.json()) as { title?: string };
    return data.title?.trim() || null;
  } catch {
    return null;
  }
}

async function fetchHtmlTitle(url: string): Promise<string | null> {
  const res = await fetchWithTimeout(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PetalFlow/1.0; +https://petalflow.app)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res?.ok) return null;

  const html = (await res.text()).slice(0, 250_000);

  const patterns = [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]?.trim()) {
      return decodeHtmlEntities(match[1].trim());
    }
  }

  return null;
}

export interface ResolveTitleOptions {
  url: string;
  platform?: Platform;
  currentTitle?: string | null;
  /** Skip OpenGraph fetch when the caller already tried it. */
  skipOpenGraph?: boolean;
}

/**
 * Resolve the best display title for a petal URL using platform APIs,
 * Open Graph, and raw HTML fallbacks.
 */
export async function resolvePetalTitle(
  url: string,
  platform?: Platform,
  currentTitle?: string | null
): Promise<string>;
export async function resolvePetalTitle(
  options: ResolveTitleOptions
): Promise<string>;
export async function resolvePetalTitle(
  urlOrOptions: string | ResolveTitleOptions,
  platform?: Platform,
  currentTitle?: string | null
): Promise<string> {
  const options: ResolveTitleOptions =
    typeof urlOrOptions === "string"
      ? { url: urlOrOptions, platform, currentTitle }
      : urlOrOptions;

  const plat = options.platform ?? detectPlatform(options.url);
  let best = options.currentTitle?.trim()
    ? cleanTitle(options.currentTitle, plat)
    : "";

  const tryCandidate = (candidate: string | null | undefined) => {
    if (!candidate?.trim()) return;
    best = pickBetterTitle(best, candidate, options.url, plat);
  };

  if (plat === "youtube") {
    tryCandidate(await fetchYoutubeTitle(options.url));
  }

  if (!options.skipOpenGraph || isWeakTitle(best, options.url, plat)) {
    const og = await extractOpenGraph(options.url);
    if (og.data?.title) {
      tryCandidate(og.data.title);
    }
  }

  if (isWeakTitle(best, options.url, plat)) {
    tryCandidate(await fetchHtmlTitle(options.url));
  }

  if (isWeakTitle(best, options.url, plat)) {
    return fallbackTitle(options.url);
  }

  return cleanTitle(best, plat);
}
