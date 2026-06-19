import type { Browser } from "playwright";

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
];

let sharedBrowser: Browser | null = null;
let browserPromise: Promise<Browser> | null = null;

export async function getBrowser(): Promise<Browser> {
  if (sharedBrowser?.isConnected()) return sharedBrowser;

  if (!browserPromise) {
    browserPromise = launchBrowser();
  }

  try {
    sharedBrowser = await browserPromise;
    return sharedBrowser;
  } finally {
    browserPromise = null;
  }
}

async function launchBrowser(): Promise<Browser> {
  const { chromium } = await import("playwright");
  return chromium.launch({
    headless: true,
    args: LAUNCH_ARGS,
  });
}

export async function closeBrowser(): Promise<void> {
  if (sharedBrowser) {
    await sharedBrowser.close().catch(() => undefined);
    sharedBrowser = null;
  }
  browserPromise = null;
}

export async function withBrowserPage<T>(
  fn: (page: import("playwright").Page) => Promise<T>
): Promise<T> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale: "en-US",
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  try {
    return await fn(page);
  } finally {
    await context.close().catch(() => undefined);
  }
}
