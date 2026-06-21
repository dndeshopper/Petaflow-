import { MESSAGE, type CapturePageMessage, type PageCapture } from "./types";
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

function findXStatusUrlInTree(start: Element): string | null {
  let el: Element | null = start;

  while (el && el !== document.body) {
    if (el.tagName === "ARTICLE" || el.getAttribute("data-testid") === "tweet") {
      const link = el.querySelector('a[href*="/status/"]');
      if (link instanceof HTMLAnchorElement) {
        const normalized = normalizeXStatusUrl(link.href);
        if (normalized) return normalized;
      }
    }
    el = el.parentElement;
  }

  el = start;
  while (el && el !== document.body) {
    const links = el.querySelectorAll('a[href*="/status/"]');
    for (const link of links) {
      if (link instanceof HTMLAnchorElement) {
        const normalized = normalizeXStatusUrl(link.href);
        if (normalized) return normalized;
      }
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

  if (host.includes("facebook.com") || host === "fb.com" || host.includes("fb.watch")) {
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

  const candidates = [linkUrl, getYouTubeWatchUrl(), window.location.href];
  for (const raw of candidates) {
    if (!raw) continue;
    const picked = pickBestCaptureUrl(raw, window.location.href);
    if (picked) return picked;
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
