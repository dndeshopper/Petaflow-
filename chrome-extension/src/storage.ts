import type { ExtensionSettings } from "./types";

const DEFAULT_API_URL = "https://petaflow.vercel.app";

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.sync.get([
    "apiUrl",
    "apiKey",
    "userId",
  ]);

  return {
    apiUrl: (stored.apiUrl as string | undefined) || DEFAULT_API_URL,
    apiKey: stored.apiKey as string | undefined,
    userId: stored.userId as string | undefined,
  };
}
