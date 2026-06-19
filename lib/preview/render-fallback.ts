import { withBrowserPage } from "@/lib/playwright/browser";

const CARD_WIDTH = 640;
const CARD_HEIGHT = 360;

/**
 * Rasterizes an SVG fallback card to a JPEG buffer for storage and display.
 */
export async function rasterizeFallbackSvg(svg: string): Promise<Buffer> {
  return withBrowserPage(async (page) => {
    await page.setViewportSize({ width: CARD_WIDTH, height: CARD_HEIGHT });
    await page.setContent(
      `<!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"/></head>
        <body style="margin:0;padding:0;background:#f4f3f1;display:flex;align-items:center;justify-content:center;">
          ${svg}
        </body>
      </html>`,
      { waitUntil: "domcontentloaded", timeout: 10_000 }
    );

    const buffer = await page.screenshot({
      type: "jpeg",
      quality: 88,
      clip: { x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
      animations: "disabled",
    });

    return Buffer.from(buffer);
  });
}
