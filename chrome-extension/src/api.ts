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

export interface CreatedPetal {
  id: string;
}

function authHeaders(settings: ExtensionSettings): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (settings.apiKey) {
    headers["x-api-key"] = settings.apiKey;
  }
  return headers;
}

export async function createPetal(
  settings: ExtensionSettings,
  payload: CreatePetalPayload
): Promise<CreatedPetal> {
  const baseUrl = settings.apiUrl.replace(/\/$/, "");

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
    headers: authHeaders(settings),
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

  const data = (await response.json()) as { petal?: { id?: string } };
  const id = data.petal?.id;
  if (!id) {
    throw new PetalApiError("Petal saved but no id returned");
  }

  return { id };
}

export async function uploadPetalScreenshot(
  settings: ExtensionSettings,
  petalId: string,
  imageDataUrl: string,
  meta?: { title?: string; description?: string }
): Promise<void> {
  const baseUrl = settings.apiUrl.replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/api/petals/${petalId}/preview/upload`, {
    method: "POST",
    headers: authHeaders(settings),
    body: JSON.stringify({
      image: imageDataUrl,
      title: meta?.title,
      description: meta?.description,
    }),
  });

  if (!response.ok) {
    let message = "Failed to upload screenshot";
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore
    }
    throw new PetalApiError(message, response.status);
  }
}
