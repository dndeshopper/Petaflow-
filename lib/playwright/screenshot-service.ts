import { withBrowserPage } from "./browser";
import { dismissCookieBanners } from "./cookie-banners";

const NAVIGATION_TIMEOUT_MS = 45_000;
const NETWORK_IDLE_TIMEOUT_MS = 12_000;
const POST_LOAD_SETTLE_MS = 1_200;

export type ScreenshotErrorCode =
  | "timeout"
  | "navigation"
  | "blocked"
  | "screenshot"
  | "unknown";

export interface ScreenshotCaptureResult {
  success: boolean;
  buffer?: Buffer;
  finalUrl?: string;
  title?: string;
  error?: string;
  errorCode?: ScreenshotErrorCode;
}

export interface ScreenshotOptions {
  /** Original URL — used for logging; navigation follows redirects automatically. */
  url: string;
}

/**
 * Captures a JPEG screenshot of a URL using a headless Chromium browser.
 * Handles redirects, slow pages, cookie banners, and partial load failures.
 */
export async function capturePageScreenshot(
  options: ScreenshotOptions
): Promise<ScreenshotCaptureResult> {
  const { url } = options;

  try {
    return await withBrowserPage(async (page) => {
      await page.route("**/*", (route) => {
        const type = route.request().resourceType();
        if (type === "media") {
          return route.abort();
        }
        return route.continue();
      });

      let navigationError: Error | null = null;

      try {
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: NAVIGATION_TIMEOUT_MS,
        });

        if (response && response.status() >= 400) {
          const status = response.status();
          if (status === 403 || status === 401) {
            return {
              success: false,
              error: `Access blocked (HTTP ${status})`,
              errorCode: "blocked",
            };
          }
        }
      } catch (err) {
        navigationError = err instanceof Error ? err : new Error(String(err));

        const isTimeout =
          navigationError.message.includes("Timeout") ||
          navigationError.name === "TimeoutError";

        if (!isTimeout) {
          return {
            success: false,
            error: navigationError.message,
            errorCode: "navigation",
          };
        }
        // Timeout on domcontentloaded — attempt screenshot of whatever rendered
      }

      await dismissCookieBanners(page);

      try {
        await page.waitForLoadState("networkidle", {
          timeout: NETWORK_IDLE_TIMEOUT_MS,
        });
      } catch {
        // Slow sites: proceed with partial render
      }

      await page.waitForTimeout(POST_LOAD_SETTLE_MS);

      const finalUrl = page.url();
      const domTitle = await page
        .evaluate(() => {
          const metaOg = document.querySelector('meta[property="og:title"]');
          if (metaOg instanceof HTMLMetaElement && metaOg.content) {
            return metaOg.content.trim();
          }

          const ytTitle = document.querySelector(
            "h1.ytd-watch-metadata yt-formatted-string, h1 yt-formatted-string"
          );
          if (ytTitle?.textContent?.trim()) {
            return ytTitle.textContent.trim();
          }

          return document.title?.trim() || null;
        })
        .catch(() => null);
      const title = domTitle || (await page.title()) || undefined;

      if (finalUrl.startsWith("chrome-error://")) {
        return {
          success: false,
          error: navigationError?.message ?? "Page failed to load",
          errorCode: "navigation",
        };
      }

      try {
        const buffer = await page.screenshot({
          type: "jpeg",
          quality: 82,
          fullPage: false,
          animations: "disabled",
          timeout: 15_000,
        });

        return {
          success: true,
          buffer: Buffer.from(buffer),
          finalUrl,
          title,
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Screenshot failed",
          errorCode: "screenshot",
          finalUrl,
          title,
        };
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Screenshot failed";
    const errorCode: ScreenshotErrorCode = message.includes("Timeout")
      ? "timeout"
      : "unknown";

    return { success: false, error: message, errorCode };
  }
}

/** @deprecated Use capturePageScreenshot */
export async function captureScreenshot(
  url: string
): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
  const result = await capturePageScreenshot({ url });
  return {
    success: result.success,
    buffer: result.buffer,
    error: result.error,
  };
}
