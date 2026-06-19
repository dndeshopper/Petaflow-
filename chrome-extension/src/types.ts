/** Message types between background and content scripts */
export const MESSAGE = {
  CAPTURE_PAGE: "PETALFLOW_CAPTURE_PAGE",
} as const;

export interface CapturePageMessage {
  type: typeof MESSAGE.CAPTURE_PAGE;
  selectionText?: string;
  linkUrl?: string;
}

export interface PageCapture {
  url: string;
  title: string;
  captured_at: string;
  selectionText?: string;
}

export interface CreatePetalPayload {
  url: string;
  title: string;
  note?: string;
  captured_at: string;
  user_id?: string;
}

export interface ExtensionSettings {
  apiUrl: string;
  apiKey?: string;
  userId?: string;
}
