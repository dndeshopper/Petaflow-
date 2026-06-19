const DATA_URL_RE = /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i;

export function decodeDataUrlImage(dataUrl: string): {
  buffer: Buffer;
  contentType: string;
} | null {
  const match = dataUrl.trim().match(DATA_URL_RE);
  if (!match) return null;

  const subtype = match[1].toLowerCase();
  const contentType =
    subtype === "png"
      ? "image/png"
      : subtype === "webp"
        ? "image/webp"
        : "image/jpeg";

  try {
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length === 0 || buffer.length > 4 * 1024 * 1024) {
      return null;
    }
    return { buffer, contentType };
  } catch {
    return null;
  }
}
