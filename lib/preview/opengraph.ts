import type { OpenGraphMetadata } from "./types";
import { cleanTitle } from "@/lib/title/resolve";

const USER_AGENT =  "Mozilla/5.0 (compatible; PetalFlow/1.0; +https://petalflow.app)";

const FETCH_TIMEOUT_MS = 12_000;

/**
 * Fetches Open Graph metadata from a URL.
 * Extracts og:title, og:image, and og:description (with sensible fallbacks).
 */
export async function extractOpenGraph(
  url: string
): Promise<{ success: boolean; data?: OpenGraphMetadata; error?: string }> {
  try {
    const ogs = (await import("open-graph-scraper")).default;
    const { result, error } = await ogs({
      url,
      timeout: FETCH_TIMEOUT_MS,
      fetchOptions: {
        headers: { "User-Agent": USER_AGENT },
      },
    });

    if (error) {
      return { success: false, error: String(error) };
    }

    const title = pickString(
      result.ogTitle,
      result.twitterTitle,
      result.dcTitle
    );

    const image = pickImageUrl(
      result.ogImage,
      result.twitterImage
    );

    const description = pickString(
      result.ogDescription,
      result.twitterDescription,
      result.dcDescription
    );

    const canonicalUrl = pickString(result.ogUrl, result.requestUrl);

    if (!title && !image && !description && !canonicalUrl) {
      return { success: false, error: "No Open Graph metadata found" };
    }

    const data: OpenGraphMetadata = {};
    if (title) data.title = cleanTitle(title);
    if (image) data.image = image;
    if (description) data.description = description;
    if (canonicalUrl) data.url = canonicalUrl;

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "OpenGraph fetch failed",
    };
  }
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function pickImageUrl(...sources: unknown[]): string | undefined {
  for (const source of sources) {
    if (!source) continue;
    if (typeof source === "string" && source.trim()) return source.trim();
    if (Array.isArray(source)) {
      for (const item of source) {
        const url =
          typeof item === "string"
            ? item
            : item && typeof item === "object" && "url" in item
              ? String((item as { url: string }).url)
              : undefined;
        if (url?.trim()) return url.trim();
      }
    }
  }
  return undefined;
}
