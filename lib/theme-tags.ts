export interface ThemeTagStyle {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

const THEME_STYLES: Record<string, ThemeTagStyle> = {
  "AI / Automation": {
    label: "AI / Automation",
    bg: "#EDF5EF",
    text: "#4A7C59",
    dot: "#6B9B7A",
  },
  "AI & Automation": {
    label: "AI & Automation",
    bg: "#EDF5EF",
    text: "#4A7C59",
    dot: "#6B9B7A",
  },
  Productivity: {
    label: "Productivity",
    bg: "#F3EEFA",
    text: "#7B6B9E",
    dot: "#9B8BBF",
  },
  Mindset: {
    label: "Mindset",
    bg: "#FFF4E8",
    text: "#B8864A",
    dot: "#D4A574",
  },
  Business: {
    label: "Business",
    bg: "#EEF2F7",
    text: "#5A6B7E",
    dot: "#7A8B9E",
  },
  Design: {
    label: "Design",
    bg: "#E8F4F4",
    text: "#4A7C7C",
    dot: "#6B9B9B",
  },
  AI: {
    label: "AI / Automation",
    bg: "#EDF5EF",
    text: "#4A7C59",
    dot: "#6B9B7A",
  },
  Startup: {
    label: "Business",
    bg: "#EEF2F7",
    text: "#5A6B7E",
    dot: "#7A8B9E",
  },
  Marketing: {
    label: "Business",
    bg: "#EEF2F7",
    text: "#5A6B7E",
    dot: "#7A8B9E",
  },
};

export function getThemeTag(theme: string | null): ThemeTagStyle | null {
  if (!theme) return null;
  return THEME_STYLES[theme] ?? {
    label: theme,
    bg: "#F5F5F3",
    text: "#6B6B6B",
    dot: "#9B9B9B",
  };
}
