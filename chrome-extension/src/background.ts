import { createPetal, PetalApiError } from "./api";
import { getSettings } from "./storage";
import {
  MESSAGE,
  type CapturePageMessage,
  type PageCapture,
} from "./types";

const MENU_ID = "petalflow-add";
const NOTIFICATION_ICON = "icons/icon48.png";
const SAVED_MESSAGE = "🌸 Saved to PetalFlow";

function isSavableUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function setupContextMenu(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Add to PetalFlow",
      contexts: ["page", "link", "selection"],
    });
  });
}

async function captureFromTab(
  tabId: number,
  options: { selectionText?: string; linkUrl?: string }
): Promise<PageCapture | null> {
  const message: CapturePageMessage = {
    type: MESSAGE.CAPTURE_PAGE,
    selectionText: options.selectionText,
    linkUrl: options.linkUrl,
  };

  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    return null;
  }
}

function fallbackCapture(
  url: string,
  title: string,
  selectionText?: string
): PageCapture {
  const capture: PageCapture = {
    url,
    title: title.trim() || url,
    captured_at: new Date().toISOString(),
  };

  if (selectionText?.trim()) {
    capture.selectionText = selectionText.trim();
  }

  return capture;
}

async function resolveCapture(
  info: chrome.contextMenus.OnClickData,
  tab: chrome.tabs.Tab | undefined
): Promise<PageCapture | null> {
  const url = info.linkUrl || info.pageUrl || tab?.url;
  if (!url || !isSavableUrl(url)) return null;

  if (tab?.id != null) {
    const fromContent = await captureFromTab(tab.id, {
      selectionText: info.selectionText,
      linkUrl: info.linkUrl,
    });

    if (fromContent) {
      return {
        ...fromContent,
        url: info.linkUrl || fromContent.url,
        selectionText:
          info.selectionText?.trim() || fromContent.selectionText,
      };
    }
  }

  return fallbackCapture(url, tab?.title || url, info.selectionText);
}

function showNotification(title: string, message: string): void {
  chrome.notifications.create({
    type: "basic",
    iconUrl: NOTIFICATION_ICON,
    title,
    message,
  });
}

async function savePetal(capture: PageCapture): Promise<void> {
  const settings = await getSettings();

  await createPetal(settings, {
    url: capture.url,
    title: capture.title,
    note: capture.selectionText,
    captured_at: capture.captured_at,
  });
}

chrome.runtime.onInstalled.addListener(setupContextMenu);
chrome.runtime.onStartup.addListener(setupContextMenu);

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) return;

  const capture = await resolveCapture(info, tab);
  if (!capture) {
    showNotification(
      "PetalFlow",
      "Cannot save this page. Only http(s) links are supported."
    );
    return;
  }

  try {
    await savePetal(capture);
    showNotification("PetalFlow", SAVED_MESSAGE);
  } catch (err) {
    const message =
      err instanceof PetalApiError
        ? err.message
        : "Failed to save. Check your connection and API settings.";

    showNotification("PetalFlow", message);
    console.error("[PetalFlow] Save error:", err);
  }
});
