import type { Browser } from "playwright-core";

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
];

let sharedBrowser: Browser | null = null;
let browserPromise: Promise<Browser> | null = null;

function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL);
}

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
  if (isVercelRuntime()) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const { chromium: pwChromium } = await import("playwright-core");

    return pwChromium.launch({
      headless: true,
      args: [...chromium.args, ...LAUNCH_ARGS],
      executablePath: await chromium.executablePath(),
    });
  }

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
  fn: (page: import("playwright-core").Page) => Promise<T>
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
