import type { CreatePetalPayload, ExtensionSettings } from "./types";

export class PetalApiError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "PetalApiError";
  }
}

export async function createPetal(
  settings: ExtensionSettings,
  payload: CreatePetalPayload
): Promise<void> {
  const baseUrl = settings.apiUrl.replace(/\/$/, "");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (settings.apiKey) {
    headers["x-api-key"] = settings.apiKey;
  }

  const body: Record<string, string> = {
    url: payload.url,
    title: payload.title,
    captured_at: payload.captured_at,
  };

  if (payload.note) body.note = payload.note;
  if (payload.user_id ?? settings.userId) {
    body.user_id = payload.user_id ?? settings.userId!;
  }

  const response = await fetch(`${baseUrl}/api/petals`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = "Failed to save petal";
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore parse errors
    }
    throw new PetalApiError(message, response.status);
  }
}
