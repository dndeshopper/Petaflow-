import type { CSSProperties } from "react";

// Converts an inline CSS string ("padding:10px; color:#fff") into a React style object.
export function s(css: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const rule of css.split(";")) {
    const i = rule.indexOf(":");
    if (i === -1) continue;
    const key = rule
      .slice(0, i)
      .trim()
      .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    const val = rule.slice(i + 1).trim();
    if (key) out[key] = val;
  }
  return out as CSSProperties;
}
