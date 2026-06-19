import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";
import type {
  Collection,
  GardenTopic,
  Petal,
  Platform,
  TodayStats,
  UserProfile,
} from "@/lib/types";
import { getPlatformConfig } from "@/lib/platforms";

import { getYoutubeThumbnailUrl } from "@/lib/preview/youtube";

const YT = "linear-gradient(135deg,#2a2540,#4a3d6b)";
const IG = "linear-gradient(135deg,#f9ce5b,#ee583f 45%,#d92e8c 75%,#9b3bc4)";
const X_BG = "linear-gradient(135deg,#2c2c2e,#444448)";

const PLATFORM_EXPORT: Record<
  Platform,
  { platform: string; platGlyph: string; platBg: string; thumb: string }
> = {
  youtube: { platform: "YouTube", platGlyph: "▶", platBg: "#ff0000", thumb: YT },
  instagram: {
    platform: "Instagram",
    platGlyph: "◎",
    platBg: IG,
    thumb: "linear-gradient(135deg,#d8cdbc,#bcae98)",
  },
  tiktok: {
    platform: "TikTok",
    platGlyph: "♪",
    platBg: "#000",
    thumb: "repeating-linear-gradient(45deg,#e9e6e1 0 7px,#f1efeb 7px 14px)",
  },
  x: { platform: "X (Twitter)", platGlyph: "𝕏", platBg: "#000", thumb: X_BG },
  linkedin: {
    platform: "LinkedIn",
    platGlyph: "in",
    platBg: "#0A66C2",
    thumb: "linear-gradient(135deg,#cdd4dc,#a7b2bd)",
  },
  medium: {
    platform: "Medium",
    platGlyph: "M",
    platBg: "#000",
    thumb: "linear-gradient(135deg,#c9cdc2,#9ba38c)",
  },
  website: {
    platform: "Website",
    platGlyph: "◍",
    platBg: "#6f8fb5",
    thumb: "linear-gradient(135deg,#cdd4dc,#a7b2bd)",
  },
};

const THEME_EXPORT: Record<
  string,
  { tagColor: string; tagBg: string; dot: string; accent: string }
> = {
  "AI / Automation": { tagColor: "#5048c8", tagBg: "#ebeafb", dot: "#6c5ce7", accent: "#6c5ce7" },
  "AI & Automation": { tagColor: "#5048c8", tagBg: "#ebeafb", dot: "#6c5ce7", accent: "#6c5ce7" },
  AI: { tagColor: "#5048c8", tagBg: "#ebeafb", dot: "#6c5ce7", accent: "#6c5ce7" },
  Productivity: { tagColor: "#7a5f8a", tagBg: "#f3eef7", dot: "#9b7ff0", accent: "#9b7ff0" },
  Mindset: { tagColor: "#5b50c0", tagBg: "#eceafb", dot: "#7a5f8a", accent: "#7a5f8a" },
  Business: { tagColor: "#5048c8", tagBg: "#ebeafb", dot: "#8458c0", accent: "#8458c0" },
  Design: { tagColor: "#8458c0", tagBg: "#f1ecfb", dot: "#b9a3f0", accent: "#b9a3f0" },
  Lifestyle: { tagColor: "#7a5f8a", tagBg: "#f3eef7", dot: "#9b7ff0", accent: "#9b7ff0" },
  Marketing: { tagColor: "#5048c8", tagBg: "#ebeafb", dot: "#8458c0", accent: "#8458c0" },
  Startups: { tagColor: "#5048c8", tagBg: "#ebeafb", dot: "#8458c0", accent: "#8458c0" },
  Fitness: { tagColor: "#7a5f8a", tagBg: "#f3eef7", dot: "#9b7ff0", accent: "#9b7ff0" },
};

const DEFAULT_THEME = {
  tagColor: "#5048c8",
  tagBg: "#ebeafb",
  dot: "#6c5ce7",
  accent: "#6c5ce7",
};

const COLLECTION_COVERS = [
  {
    cover: "linear-gradient(135deg,#e3ddf8,#c3b6f0)",
    stack: ["#cdc4f3", "#b9a3f0", "#8b7ff0"],
  },
  {
    cover: "linear-gradient(135deg,#ead9f1,#d3b6e4)",
    stack: ["#e0c6ed", "#cfa8e0", "#b07fc8"],
  },
  {
    cover: "linear-gradient(135deg,#d8d2f4,#a89cef)",
    stack: ["#cdc4f3", "#a99cf0", "#6c5ce7"],
  },
  {
    cover: "linear-gradient(135deg,#dbe0e6,#b6c0cc)",
    stack: ["#cdd4dc", "#a7b2bd", "#7e8c99"],
  },
  {
    cover: "linear-gradient(135deg,#ecdcc4,#d6b98c)",
    stack: ["#e6d3b8", "#d4ab74", "#bb8c4e"],
  },
  {
    cover: "linear-gradient(135deg,#e6e3df,#c8c3bb)",
    stack: ["#e2dfd9", "#c8c3bb", "#a39d92"],
  },
];

const GARDEN_STYLES = [
  { bg: "#f1effb", flower: "#6c5ce7", bars: "#cdc4f3", growth: "thriving" },
  { bg: "#f4f0f8", flower: "#9b7ff0", bars: "#d7cbef", growth: "growing" },
  { bg: "#f3eefa", flower: "#b9a3f0", bars: "#ddd0f2", growth: "thriving" },
  { bg: "#f2f0f6", flower: "#8458c0", bars: "#d3c6e4", growth: "budding" },
  { bg: "#f4f1f5", flower: "#7a5f8a", bars: "#d8cdde", growth: "budding" },
  { bg: "#f5f1f0", flower: "#a87f72", bars: "#e3d3cc", growth: "growing" },
];

function themeStyle(theme: string | null) {
  if (!theme) return DEFAULT_THEME;
  return THEME_EXPORT[theme] ?? DEFAULT_THEME;
}

function petalTime(petal: Petal): string {
  return format(parseISO(petal.created_at), "HH:mm");
}

function petalDate(petal: Petal): string {
  return format(parseISO(petal.created_at), "d MMM");
}

function petalRelative(petal: Petal): string {
  return formatDistanceToNow(parseISO(petal.created_at), { addSuffix: true });
}

function resolveThumbImageUrl(petal: Petal): string | null {
  if (petal.preview_url) return petal.preview_url;
  if (petal.platform === "youtube") return getYoutubeThumbnailUrl(petal.url);
  return null;
}

function thumbBgFor(petal: Petal): string {
  return PLATFORM_EXPORT[petal.platform]?.thumb ?? PLATFORM_EXPORT.website.thumb;
}

function thumbLabel(petal: Petal, hasImage: boolean): string {
  if (hasImage) return "";
  const words = petal.title.split(/\s+/).slice(0, 2);
  return words.map((w) => w.slice(0, 4).toUpperCase()).join(" ");
}

export interface ExportTimelineItem {
  id: string;
  url: string;
  platform: string;
  platGlyph: string;
  platBg: string;
  time: string;
  title: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  accent: string;
  thumbBg: string;
  thumbImageUrl: string | null;
  thumbLabel: string;
}

export interface ExportTimelineDay {
  label: string;
  sub: string;
  count: number;
  dotColor: string;
  ringColor: string;
  items: ExportTimelineItem[];
}

export interface ExportTimelineFilter {
  label: string;
  count: number;
  dot: string | null;
}

export function petalToTimelineItem(petal: Petal): ExportTimelineItem {
  const plat = PLATFORM_EXPORT[petal.platform] ?? PLATFORM_EXPORT.website;
  const theme = themeStyle(petal.theme);
  const thumbImageUrl = resolveThumbImageUrl(petal);
  return {
    id: petal.id,
    url: petal.url,
    platform: plat.platform,
    platGlyph: plat.platGlyph,
    platBg: plat.platBg,
    time: petalTime(petal),
    title: petal.title,
    tag: petal.theme ?? "Uncategorized",
    tagColor: theme.tagColor,
    tagBg: theme.tagBg,
    accent: theme.accent,
    thumbBg: thumbBgFor(petal),
    thumbImageUrl,
    thumbLabel: thumbLabel(petal, Boolean(thumbImageUrl)),
  };
}

export function buildTimelineFilters(petals: Petal[]): ExportTimelineFilter[] {
  const themeCounts: Record<string, number> = {};
  petals.forEach((p) => {
    const key = p.theme ?? "Uncategorized";
    themeCounts[key] = (themeCounts[key] ?? 0) + 1;
  });

  const filters: ExportTimelineFilter[] = [
    { label: "All", count: petals.length, dot: null },
  ];

  Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([label, count]) => {
      const style = themeStyle(label);
      filters.push({ label, count, dot: style.dot });
    });

  return filters;
}

function dayLabel(date: Date): { label: string; sub: string } {
  if (isToday(date)) return { label: "Today", sub: format(date, "d MMMM") };
  if (isYesterday(date)) return { label: "Yesterday", sub: format(date, "d MMMM") };
  return { label: format(date, "EEEE"), sub: format(date, "d MMMM") };
}

export function buildTimelineDays(
  petals: Petal[],
  themeFilter?: string
): ExportTimelineDay[] {
  let filtered = petals;
  if (themeFilter && themeFilter !== "All") {
    filtered = petals.filter((p) => (p.theme ?? "Uncategorized") === themeFilter);
  }

  const groups = new Map<string, Petal[]>();
  filtered.forEach((petal) => {
    const key = format(parseISO(petal.created_at), "yyyy-MM-dd");
    const list = groups.get(key) ?? [];
    list.push(petal);
    groups.set(key, list);
  });

  const dotColors = ["#6c5ce7", "#9b7ff0", "#b9a3f0", "#8458c0", "#7a5f8a"];
  const ringColors = ["#d6d3f3", "#e3ddf8", "#ece4fa", "#d3c6e4", "#d8cdde"];

  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dateKey, items], index) => {
      const date = parseISO(`${dateKey}T12:00:00`);
      const { label, sub } = dayLabel(date);
      const sorted = [...items].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return {
        label,
        sub,
        count: sorted.length,
        dotColor: dotColors[index % dotColors.length],
        ringColor: ringColors[index % ringColors.length],
        items: sorted.map(petalToTimelineItem),
      };
    });
}

export function getTodayPetals(petals: Petal[]): Petal[] {
  return petals.filter((p) => isToday(parseISO(p.created_at)));
}

export interface ExportSearchResult {
  id: string;
  url: string;
  platform: string;
  platGlyph: string;
  platBg: string;
  date: string;
  title: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  thumbBg: string;
  thumbImageUrl: string | null;
  thumbLabel: string;
}

export function petalToSearchResult(petal: Petal): ExportSearchResult {
  const item = petalToTimelineItem(petal);
  return {
    id: petal.id,
    url: item.url,
    platform: item.platform,
    platGlyph: item.platGlyph,
    platBg: item.platBg,
    date: petalDate(petal),
    title: item.title,
    tag: item.tag,
    tagColor: item.tagColor,
    tagBg: item.tagBg,
    thumbBg: item.thumbBg,
    thumbImageUrl: item.thumbImageUrl,
    thumbLabel: item.thumbLabel,
  };
}

export interface ExportGardenTheme {
  id: string;
  name: string;
  count: number;
  growth: string;
  bg: string;
  flower: string;
  bars: { h: string; c: string }[];
}

function barsFromCount(count: number, color: string) {
  const base = Math.min(95, Math.max(20, count * 3));
  return [0.4, 0.65, 0.55, 0.8, 0.7, 0.95, 0.6].map((m) => ({
    h: `${Math.round(base * m)}%`,
    c: color,
  }));
}

export function gardenTopicsToExport(topics: GardenTopic[]): ExportGardenTheme[] {
  return topics.map((topic, i) => {
    const style = GARDEN_STYLES[i % GARDEN_STYLES.length];
    const growth =
      topic.growth_level >= 4
        ? "thriving"
        : topic.growth_level >= 2
          ? "growing"
          : "budding";
    return {
      id: topic.id,
      name: topic.name,
      count: topic.petal_count,
      growth,
      bg: style.bg,
      flower: style.flower,
      bars: barsFromCount(topic.petal_count, style.bars),
    };
  });
}

export interface ExportCollection {
  id: string;
  name: string;
  desc: string;
  count: number;
  updated: string;
  cover: string;
  stack: string[];
}

export function collectionsToExport(items: Collection[]): ExportCollection[] {
  return items.map((c, i) => {
    const visual = COLLECTION_COVERS[i % COLLECTION_COVERS.length];
    return {
      id: c.id,
      name: c.name,
      desc: c.description ?? "",
      count: c.petal_count,
      updated: formatDistanceToNow(parseISO(c.created_at), { addSuffix: true }),
      cover: visual.cover,
      stack: visual.stack,
    };
  });
}

export interface ExportInboxItem {
  id: string;
  url: string;
  platform: string;
  platGlyph: string;
  platBg: string;
  time: string;
  title: string;
  suggestion: string;
  tagColor: string;
  tagBg: string;
  unreadColor: string;
  thumbBg: string;
  thumbImageUrl: string | null;
  thumbLabel: string;
}

export function petalToInboxItem(petal: Petal): ExportInboxItem {
  const item = petalToTimelineItem(petal);
  return {
    id: petal.id,
    url: item.url,
    platform: item.platform,
    platGlyph: item.platGlyph,
    platBg: item.platBg,
    time: petalRelative(petal),
    title: item.title,
    suggestion: petal.theme ?? "Uncategorized",
    tagColor: item.tagColor,
    tagBg: item.tagBg,
    unreadColor: petal.viewed ? "#cdc9c3" : "#6c5ce7",
    thumbBg: item.thumbBg,
    thumbImageUrl: item.thumbImageUrl,
    thumbLabel: item.thumbLabel,
  };
}

export function greetingForUser(user: UserProfile): string {
  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const first = user.full_name?.split(" ")[0] ?? "there";
  return `${salutation}, ${first}`;
}

export function todayOverview(stats: TodayStats) {
  return {
    petalsSaved: stats.petals_saved,
    minutesToWatch: stats.minutes_to_watch,
    topThemes: stats.top_themes.map((t) => {
      const style = themeStyle(t.name);
      return { name: t.name, color: style.dot, count: t.count };
    }),
    recentCollections: stats.recent_collections.map((c, i) => ({
      name: c.name,
      bg: COLLECTION_COVERS[i % COLLECTION_COVERS.length].cover,
      sub: `${c.petal_count} petals`,
    })),
  };
}

export function platformDisplayName(platform: Platform): string {
  return getPlatformConfig(platform).name;
}
