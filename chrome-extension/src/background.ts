import { createPetal, PetalApiError, uploadPetalScreenshot } from "./api";
import { getSettings } from "./storage";
import { pickCaptureUrl, isSavableUrl, extractYoutubeVideoId } from "./url-utils";
import { resolveTitleBeforeSave } from "./title-utils";
import {
  MESSAGE,
  type CapturePageMessage,
  type PageCapture,
} from "./types";

const MENU_ID = "petalflow-add";
const NOTIFICATION_ICON = "icons/icon48.png";
const SAVED_MESSAGE = "🌸 Salvato in PetalFlow — clicca per aprire la dashboard";

function setupContextMenu(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Aggiungi a PetalFlow",
      contexts: ["page", "link", "selection", "video"],
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
  const url = pickCaptureUrl({
    linkUrl: info.linkUrl,
    pageUrl: info.pageUrl,
    srcUrl: info.srcUrl,
    tabUrl: tab?.url,
  });

  if (!url || !isSavableUrl(url)) return null;

  if (tab?.id != null) {
    const fromContent = await captureFromTab(tab.id, {
      selectionText: info.selectionText,
      linkUrl: info.linkUrl || url,
    });

    if (fromContent) {
      return {
        ...fromContent,
        url,
        title: fromContent.title?.trim() || tab.title || url,
        selectionText:
          info.selectionText?.trim() || fromContent.selectionText,
      };
    }
  }

  return fallbackCapture(url, tab?.title || url, info.selectionText);
}

async function resolveCaptureFromTab(
  tab: chrome.tabs.Tab
): Promise<PageCapture | null> {
  const url = pickCaptureUrl({ tabUrl: tab.url, pageUrl: tab.url });
  if (!url || !isSavableUrl(url)) return null;

  if (tab.id != null) {
    const fromContent = await captureFromTab(tab.id, { linkUrl: url });
    if (fromContent) {
      return { ...fromContent, url };
    }
  }

  return fallbackCapture(url, tab.title || url);
}

async function captureVisibleTabScreenshot(
  tab: chrome.tabs.Tab
): Promise<string | null> {
  if (tab.windowId == null) return null;

  try {
    return await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "jpeg",
      quality: 84,
    });
  } catch (err) {
    console.warn("[PetalFlow] Tab screenshot failed:", err);
    return null;
  }
}

function showNotification(title: string, message: string): void {
  chrome.notifications.create({
    type: "basic",
    iconUrl: NOTIFICATION_ICON,
    title,
    message,
  });
}

async function savePetalWithScreenshot(
  capture: PageCapture,
  tab?: chrome.tabs.Tab
): Promise<void> {
  const settings = await getSettings();
  const title = await resolveTitleBeforeSave(capture.url, capture.title);
  const resolvedCapture = { ...capture, title };

  const { id } = await createPetal(settings, {
    url: resolvedCapture.url,
    title: resolvedCapture.title,
    note: resolvedCapture.selectionText,
    captured_at: resolvedCapture.captured_at,
  });

  if (tab && !extractYoutubeVideoId(resolvedCapture.url)) {
    const screenshot = await captureVisibleTabScreenshot(tab);
    if (screenshot) {
      try {
        await uploadPetalScreenshot(settings, id, screenshot, {
          title: resolvedCapture.title,
        });
      } catch (err) {
        console.warn("[PetalFlow] Preview upload failed:", err);
      }
    }
  }
}

chrome.runtime.onInstalled.addListener(setupContextMenu);
chrome.runtime.onStartup.addListener(setupContextMenu);

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) return;

  const capture = await resolveCapture(info, tab);
  if (!capture) {
    showNotification(
      "PetalFlow",
      "Impossibile salvare questo contenuto. Usa un link http(s)."
    );
    return;
  }

  try {
    await savePetalWithScreenshot(capture, tab);
    showNotification("PetalFlow", SAVED_MESSAGE);
  } catch (err) {
    const message =
      err instanceof PetalApiError
        ? err.message
        : "Salvataggio fallito. Controlla connessione e impostazioni API.";

    showNotification("PetalFlow", message);
    console.error("[PetalFlow] Save error:", err);
  }
});

chrome.notifications.onClicked.addListener(async () => {
  const settings = await getSettings();
  const dashboard = `${settings.apiUrl.replace(/\/$/, "")}/dashboard`;
  await chrome.tabs.create({ url: dashboard });
});

async function saveActiveTab(): Promise<{ ok: boolean; message: string }> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    return { ok: false, message: "Nessuna scheda attiva." };
  }

  const capture = await resolveCaptureFromTab(tab);
  if (!capture) {
    return {
      ok: false,
      message: "Questa pagina non può essere salvata.",
    };
  }

  try {
    await savePetalWithScreenshot(capture, tab);
    return { ok: true, message: "🌸 Salvato con miniatura screenshot!" };
  } catch (err) {
    const message =
      err instanceof PetalApiError
        ? err.message
        : "Salvataggio fallito. Controlla API URL e chiave.";
    return { ok: false, message };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === MESSAGE.SAVE_ACTIVE_TAB) {
    void saveActiveTab().then(sendResponse);
    return true;
  }
  return false;
});
