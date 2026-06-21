import { MESSAGE, type CapturePageMessage, type PageCapture } from "./types";
import {
  isFacebookHost,
  isGenericFacebookUrl,
  normalizeFacebookPostUrl,
  pickFacebookPostUrl,
} from "./facebook-url";
import {
  extractYoutubeVideoId,
  normalizeYoutubeUrl,
  normalizeXStatusUrl,
  pickBestCaptureUrl,
  pickXPostUrl,
} from "./url-utils";

let lastContextTarget: Element | null = null;

document.addEventListener(
  "contextmenu",
  (event) => {
    lastContextTarget = event.target instanceof Element ? event.target : null;
  },
  true
);

function getYouTubeTitle(): string | null {
  const selectors = [
    "h1.ytd-watch-metadata yt-formatted-string",
    "h1 yt-formatted-string",
    "#title h1",
    "meta[property='og:title']",
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLMetaElement && el.content) {
      return el.content.replace(/\s*-\s*YouTube\s*$/i, "").trim();
    }
    const text = el?.textContent?.trim();
    if (text) return text;
  }

  return null;
}

function getYouTubeWatchUrl(): string | null {
  const id = extractYoutubeVideoId(window.location.href);
  if (!id) return null;
  return normalizeYoutubeUrl(`https://www.youtube.com/watch?v=${id}`);
}

function scoreFacebookLink(link: HTMLAnchorElement, url: string): number {
  let score = 0;
  if (url.includes("/posts/")) score += 12;
  if (url.includes("pfbid")) score += 8;
  if (url.includes("/permalink/")) score += 11;
  if (url.includes("permalink.php")) score += 10;
  if (url.includes("/reel/")) score += 9;
  if (url.includes("/watch/?v=")) score += 8;
  if (url.includes("/photo/")) score += 4;

  const text = (link.textContent ?? "").trim();
  if (/^\d+\s*(min|h|g|d|w|m|ore|sec|s)?/i.test(text)) score += 14;
  if (/\d{1,2}:\d{2}/.test(text)) score += 12;
  if (link.getAttribute("aria-label")?.match(/\d{4}/)) score += 6;

  return score;
}

function findBestFacebookLinkIn(root: Element): string | null {
  let best: string | null = null;
  let bestScore = -1;

  for (const link of root.querySelectorAll("a[href]")) {
    if (!(link instanceof HTMLAnchorElement)) continue;
    const normalized = normalizeFacebookPostUrl(link.href);
    if (!normalized) continue;
    const score = scoreFacebookLink(link, normalized);
    if (score > bestScore) {
      bestScore = score;
      best = normalized;
    }
  }

  return best;
}

function findFacebookPostUrlInTree(start: Element): string | null {
  let container: Element | null = start;

  while (container && container !== document.body) {
    if (
      container.getAttribute("role") === "article" ||
      /FeedUnit/i.test(container.getAttribute("data-pagelet") ?? "")
    ) {
      const found = findBestFacebookLinkIn(container);
      if (found) return found;
    }
    container = container.parentElement;
  }

  container = start;
  let depth = 0;
  while (container && container !== document.body && depth < 12) {
    const found = findBestFacebookLinkIn(container);
    if (found) return found;
    container = container.parentElement;
    depth += 1;
  }

  return null;
}

function getFacebookOgPostUrl(): string | null {
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl instanceof HTMLMetaElement && ogUrl.content) {
    const normalized = normalizeFacebookPostUrl(ogUrl.content);
    if (normalized) return normalized;
  }

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical instanceof HTMLLinkElement && canonical.href) {
    const normalized = normalizeFacebookPostUrl(canonical.href);
    if (normalized) return normalized;
  }

  return null;
}

function findXStatusUrlInTree(start: Element): string | null {
  let el: Element | null = start;

  while (el && el !== document.body) {
    if (
      el.tagName === "ARTICLE" ||
      el.getAttribute("data-testid") === "tweet" ||
      el.getAttribute("data-testid") === "cellInnerDiv"
    ) {
      for (const link of el.querySelectorAll('a[href*="/status/"]')) {
        if (!(link instanceof HTMLAnchorElement)) continue;
        const normalized = normalizeXStatusUrl(link.href);
        if (normalized) return normalized;
      }
    }
    el = el.parentElement;
  }

  el = start;
  while (el && el !== document.body) {
    for (const link of el.querySelectorAll('a[href*="/status/"]')) {
      if (!(link instanceof HTMLAnchorElement)) continue;
      const normalized = normalizeXStatusUrl(link.href);
      if (normalized) return normalized;
    }
    el = el.parentElement;
  }

  return null;
}

function getXPostUrl(linkUrl?: string): string | null {
  return pickXPostUrl(
    linkUrl,
    window.location.href,
    lastContextTarget ? findXStatusUrlInTree(lastContextTarget) : null
  );
}

function getFacebookPostUrl(linkUrl?: string): string | null {
  const fromDom = lastContextTarget ? findFacebookPostUrlInTree(lastContextTarget) : null;
  const fromOg = getFacebookOgPostUrl();

  return pickFacebookPostUrl(
    linkUrl,
    fromDom,
    fromOg,
    window.location.href
  );
}

function isXPage(): boolean {
  const host = window.location.hostname.replace(/^www\./, "");
  return (
    host === "x.com" ||
    host === "twitter.com" ||
    host === "mobile.x.com" ||
    host === "mobile.twitter.com"
  );
}

function getPageTitle(linkUrl?: string): string {
  const host = window.location.hostname.replace(/^www\./, "");

  if (host.includes("youtube.com") || host === "youtu.be") {
    const savedId = linkUrl ? extractYoutubeVideoId(linkUrl) : null;
    const pageId = extractYoutubeVideoId(window.location.href);
    if (savedId && pageId && savedId !== pageId) {
      return linkUrl || window.location.href;
    }

    return getYouTubeTitle() || document.title.replace(/\s*-\s*YouTube\s*$/i, "").trim() || window.location.href;
  }

  if (isFacebookHost(window.location.href)) {
    const ogTitle = document.querySelector("meta[property='og:title']");
    if (ogTitle instanceof HTMLMetaElement && ogTitle.content) {
      return ogTitle.content.trim();
    }
    const cleaned = document.title.replace(/\s*\|\s*Facebook\s*$/i, "").trim();
    if (cleaned && cleaned.toLowerCase() !== "facebook") return cleaned;
  }

  const ogTitle = document.querySelector("meta[property='og:title']");
  if (ogTitle instanceof HTMLMetaElement && ogTitle.content) {
    return ogTitle.content.trim();
  }

  return document.title?.trim() || window.location.href;
}

function getPageUrl(linkUrl?: string): string {
  if (isXPage()) {
    const xPost = getXPostUrl(linkUrl);
    if (xPost) return xPost;
  }

  if (isFacebookHost(window.location.href) || (linkUrl && isFacebookHost(linkUrl))) {
    const fbPost = getFacebookPostUrl(linkUrl);
    if (fbPost) return fbPost;
  }

  const candidates = [linkUrl, getYouTubeWatchUrl(), window.location.href];
  for (const raw of candidates) {
    if (!raw) continue;
    const picked = pickBestCaptureUrl(raw, window.location.href);
    if (picked) {
      if (isFacebookHost(picked) && isGenericFacebookUrl(picked)) {
        const fbPost = getFacebookPostUrl(linkUrl);
        if (fbPost) return fbPost;
      }
      return picked;
    }
  }

  if (isFacebookHost(window.location.href)) {
    const fbPost = getFacebookPostUrl(linkUrl);
    if (fbPost) return fbPost;
  }

  return window.location.href;
}

chrome.runtime.onMessage.addListener(
  (
    message: CapturePageMessage,
    _sender,
    sendResponse: (response: PageCapture) => void
  ) => {
    if (message.type !== MESSAGE.CAPTURE_PAGE) return;

    const url = getPageUrl(message.linkUrl);
    let title = getPageTitle(message.linkUrl);

    if (message.linkUrl) {
      const savedId = extractYoutubeVideoId(url);
      const pageId = extractYoutubeVideoId(window.location.href);
      if (savedId && savedId !== pageId) {
        title = url;
      }
    }

    const captured_at = new Date().toISOString();

    const capture: PageCapture = {
      url,
      title,
      captured_at,
    };

    if (message.selectionText?.trim()) {
      capture.selectionText = message.selectionText.trim();
    }

    sendResponse(capture);
    return true;
  }
);
