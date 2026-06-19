import type { Platform } from "@/lib/types";
import { getPlatformConfig } from "@/lib/platforms";
import { design } from "@/lib/design-tokens";

export interface FallbackCardInput {
  platform: Platform;
  title: string;
  note?: string | null;
}

const CARD_WIDTH = 640;
const CARD_HEIGHT = 360;

const PLATFORM_GRADIENTS: Record<
  Platform,
  { from: string; to: string; badge: string; badgeText: string }
> = {
  youtube: { from: "#2a2540", to: "#4a3d6b", badge: "#ff0000", badgeText: "#ffffff" },
  instagram: { from: "#3d2a40", to: "#6b3d5a", badge: "#e4405f", badgeText: "#ffffff" },
  tiktok: { from: "#1a1a1a", to: "#2d2d2d", badge: "#000000", badgeText: "#ffffff" },
  x: { from: "#141414", to: "#2a2a2a", badge: "#000000", badgeText: "#ffffff" },
  linkedin: { from: "#1a2a3a", to: "#0a3d6b", badge: "#0a66c2", badgeText: "#ffffff" },
  medium: { from: "#1a1a1a", to: "#2d2d2d", badge: "#000000", badgeText: "#ffffff" },
  facebook: { from: "#1a3a6b", to: "#1877F2", badge: "#1877F2", badgeText: "#ffffff" },
  website: { from: "#2a3540", to: "#4a5a6b", badge: "#6b7b6e", badgeText: "#ffffff" },
};

/**
 * Generates a branded PetalFlow fallback preview card as SVG.
 * Always includes platform, title, and note (when provided).
 */
export function generateBrandedFallbackSvg(input: FallbackCardInput): string {
  const config = getPlatformConfig(input.platform);
  const palette =
    PLATFORM_GRADIENTS[input.platform] ?? PLATFORM_GRADIENTS.website;

  const title = input.title.trim() || config.name;
  const note = input.note?.trim() ?? "";

  const titleLines = wrapLines(title, 38, 3);
  const noteLines = note ? wrapLines(note, 46, 2) : [];

  const titleBlock = titleLines
    .map(
      (line, i) =>
        `<tspan x="40" dy="${i === 0 ? 0 : 30}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const noteBlock = noteLines
    .map(
      (line, i) =>
        `<tspan x="40" dy="${i === 0 ? 0 : 22}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const noteY = 148 + titleLines.length * 30;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.from}"/>
      <stop offset="100%" stop-color="${palette.to}"/>
    </linearGradient>
    <filter id="shadow" x="-4%" y="-4%" width="108%" height="108%">
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#000" flood-opacity="0.18"/>
    </filter>
  </defs>

  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bg)"/>
  <rect x="20" y="20" width="${CARD_WIDTH - 40}" height="${CARD_HEIGHT - 40}" rx="14" fill="${design.colors.bg}" filter="url(#shadow)"/>

  <!-- Platform badge -->
  <rect x="40" y="36" width="36" height="36" rx="10" fill="${palette.badge}"/>
  <text x="58" y="60" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="${palette.badgeText}">${escapeXml(platformInitial(config.name))}</text>
  <text x="86" y="52" font-family="system-ui,sans-serif" font-size="14" font-weight="600" fill="${design.colors.textSecondary}">${escapeXml(config.name)}</text>
  <text x="86" y="68" font-family="system-ui,sans-serif" font-size="11" fill="${design.colors.textMuted}">Saved to PetalFlow</text>

  <!-- Title -->
  <text x="40" y="118" font-family="Georgia,'Times New Roman',serif" font-size="22" font-weight="600" fill="${design.colors.text}">
    ${titleBlock}
  </text>

  ${
    noteLines.length > 0
      ? `<text x="40" y="${noteY}" font-family="system-ui,sans-serif" font-size="14" fill="${design.colors.textMuted}">
    ${noteBlock}
  </text>`
      : ""
  }

  <!-- PetalFlow brand footer -->
  <rect x="40" y="${CARD_HEIGHT - 68}" width="${CARD_WIDTH - 80}" height="1" fill="${design.colors.border}"/>
  <circle cx="54" cy="${CARD_HEIGHT - 44}" r="10" fill="${design.colors.stem}"/>
  <text x="54" y="${CARD_HEIGHT - 40}" text-anchor="middle" font-size="11">🌸</text>
  <text x="72" y="${CARD_HEIGHT - 40}" font-family="system-ui,sans-serif" font-size="12" font-weight="600" fill="${design.colors.accent}">PetalFlow</text>
  <text x="${CARD_WIDTH - 40}" y="${CARD_HEIGHT - 40}" text-anchor="end" font-family="system-ui,sans-serif" font-size="11" fill="${design.colors.textLight}">Preview</text>
</svg>`;
}

function platformInitial(name: string): string {
  if (name === "YouTube") return "▶";
  if (name === "X") return "𝕏";
  if (name === "TikTok") return "♪";
  return name.charAt(0).toUpperCase();
}

function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word;
      if (lines.length >= maxLines - 1) break;
    }
  }

  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length === 0) return [text.slice(0, maxChars)];

  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] =
      last.length > maxChars - 1 ? `${last.slice(0, maxChars - 2)}…` : `${last}…`;
  }

  return lines;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** @deprecated Use generateBrandedFallbackSvg */
export function generateFallbackCardSvg(
  platform: Platform,
  title: string,
  note?: string | null
): string {
  return generateBrandedFallbackSvg({ platform, title, note });
}
