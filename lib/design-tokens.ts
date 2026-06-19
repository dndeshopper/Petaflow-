/** Design tokens extracted from PetalFlow-Dashboard-standalone.html */
export const design = {
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  colors: {
    bg: "#ffffff",
    bgOuter: "#f4f3f1",
    bgMuted: "#f5f4f2",
    bgNavActive: "#f3f2f0",
    bgButton: "#fbfbfa",
    text: "#1c1b1a",
    textSecondary: "#3f3d3a",
    textMuted: "#9a9893",
    textLight: "#a7a5a1",
    textNav: "#6f6d69",
    border: "#ececea",
    borderCard: "#ededeb",
    borderInput: "#eeedeb",
    borderDashed: "#dcdbd8",
    accent: "#6c5ce7",
    stem: "#d6d3f3",
    stemFlower: "#8b7ff0",
    chartBar: "#e6e4e0",
    chartBarActive: "#020014",
  },
  sidebar: { width: 264 },
  rightPanel: { width: 300 },
  card: {
    radius: 16,
    shadow: "0 2px 10px rgba(0,0,0,0.03)",
  },
  logo: "/design/faaa21af-e87d-4492-a9a8-c8eda408b1b7.png",
} as const;

export const themeStyles: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  "AI / Automation": { label: "AI / Automation", color: "#5048c8", bg: "#ebeafb", dot: "#6c5ce7" },
  "AI & Automation": { label: "AI & Automation", color: "#5048c8", bg: "#ebeafb", dot: "#6c5ce7" },
  Productivity: { label: "Productivity", color: "#7a5f8a", bg: "#f3eef7", dot: "#9b7ff0" },
  Mindset: { label: "Mindset", color: "#5b50c0", bg: "#eceafb", dot: "#6c5ce7" },
  Business: { label: "Business", color: "#5048c8", bg: "#ebeafb", dot: "#6c5ce7" },
  Design: { label: "Design", color: "#8458c0", bg: "#f1ecfb", dot: "#b9a3f0" },
};

export function getThemeStyle(theme: string | null) {
  if (!theme) return null;
  return themeStyles[theme] ?? {
    label: theme,
    color: "#5048c8",
    bg: "#ebeafb",
    dot: "#6c5ce7",
  };
}

/** Hourly chart bar heights from the standalone design (percent) */
export const hourlyChartHeights = [30, 55, 40, 65, 48, 80, 100, 60, 45, 72, 38, 55, 30, 42, 25];
