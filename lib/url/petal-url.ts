import type { Platform } from "@/lib/types";
import {
  isFacebookHost,
  normalizeFacebookPostUrl,
  pickFacebookPostUrl,
} from "@/lib/url/facebook";
import {
  isXHost,
  normalizeXStatusUrl,
  pickXPostUrl,
} from "@/lib/url/x";

export function pickSocialPostUrl(
  ...candidates: (string | null | undefined)[]
): string | null {
  return pickXPostUrl(...candidates) ?? pickFacebookPostUrl(...candidates);
}

export function normalizePetalSaveUrl(url: string, platform?: Platform): string {
  if (platform === "x" || isXHost(url)) {
    return pickXPostUrl(url) ?? url;
  }
  if (platform === "facebook" || isFacebookHost(url)) {
    return pickFacebookPostUrl(url) ?? url;
  }
  return url;
}

export function resolvePetalOpenUrl(url: string, platform?: Platform | string): string {
  if (platform === "x" || isXHost(url)) {
    return pickXPostUrl(url) ?? url;
  }
  if (platform === "facebook" || isFacebookHost(url)) {
    return pickFacebookPostUrl(url) ?? url;
  }
  return url;
}

export function isSocialPostUrl(url: string, platform?: Platform): boolean {
  if (platform === "x" || isXHost(url)) {
    return normalizeXStatusUrl(url) !== null;
  }
  if (platform === "facebook" || isFacebookHost(url)) {
    return normalizeFacebookPostUrl(url) !== null;
  }
  return false;
}
