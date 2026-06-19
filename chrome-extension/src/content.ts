import { MESSAGE, type CapturePageMessage, type PageCapture } from "./types";

/**
 * Captures accurate page metadata from the DOM at save time.
 * The background script requests this when the user clicks "Add to PetalFlow".
 */
chrome.runtime.onMessage.addListener(
  (
    message: CapturePageMessage,
    _sender,
    sendResponse: (response: PageCapture) => void
  ) => {
    if (message.type !== MESSAGE.CAPTURE_PAGE) return;

    const url = message.linkUrl || window.location.href;
    const title = document.title?.trim() || url;
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
