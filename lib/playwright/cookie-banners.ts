import type { Page } from "playwright";

/** Common cookie-consent selectors across major CMPs and sites. */
const COOKIE_DISMISS_SELECTORS = [
  "#onetrust-accept-btn-handler",
  "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
  "#CybotCookiebotDialogBodyButtonAccept",
  "[data-testid='cookie-policy-dialog-accept-button']",
  "button[data-testid='accept-cookies']",
  "button[id*='accept' i][class*='cookie' i]",
  "button[class*='accept' i][class*='cookie' i]",
  "button[aria-label*='accept' i]",
  "button[aria-label*='agree' i]",
  ".fc-cta-consent",
  ".fc-button-label:has-text('Consent')",
  "#truste-consent-button",
  ".js-cookie-accept",
  ".cookie-accept",
  ".cookies-accept",
  "#cookie-accept",
  "#cookies-accept",
  "[data-cookiebanner='accept_button']",
];

const COOKIE_DISMISS_TEXT_PATTERNS = [
  /^accept$/i,
  /^accept all$/i,
  /^allow all$/i,
  /^agree$/i,
  /^i agree$/i,
  /^got it$/i,
  /^ok$/i,
  /^continue$/i,
];

/**
 * Attempts to dismiss cookie banners so screenshots capture page content.
 * Best-effort — never throws.
 */
export async function dismissCookieBanners(page: Page): Promise<void> {
  for (const selector of COOKIE_DISMISS_SELECTORS) {
    try {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 400 })) {
        await el.click({ timeout: 2000, force: true });
        await page.waitForTimeout(400);
        return;
      }
    } catch {
      // try next selector
    }
  }

  try {
    const clicked = await page.evaluate((patterns) => {
      const buttons = Array.from(
        document.querySelectorAll<HTMLElement>("button, a[role='button'], [role='button']")
      );

      for (const btn of buttons) {
        const text = (btn.innerText || btn.textContent || "").trim();
        if (!text || text.length > 40) continue;
        if (patterns.some((p) => new RegExp(p, "i").test(text))) {
          btn.click();
          return true;
        }
      }
      return false;
    }, COOKIE_DISMISS_TEXT_PATTERNS.map((p) => p.source));

    if (clicked) {
      await page.waitForTimeout(500);
    }
  } catch {
    // non-fatal
  }
}
