import type { Platform } from "./types";
import {
  Globe,
  Instagram,
  Linkedin,
  type LucideIcon,
  Twitter,
  Youtube,
} from "lucide-react";

export interface PlatformConfig {
  id: Platform;
  name: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
  domains: string[];
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function MediumIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  );
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  youtube: {
    id: "youtube",
    name: "YouTube",
    color: "#FF0000",
    bgColor: "#FFF0F0",
    icon: Youtube,
    domains: ["youtube.com", "youtu.be"],
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    color: "#E4405F",
    bgColor: "#FFF0F3",
    icon: Instagram,
    domains: ["instagram.com"],
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    color: "#000000",
    bgColor: "#F5F5F5",
    icon: TikTokIcon as unknown as LucideIcon,
    domains: ["tiktok.com"],
  },
  x: {
    id: "x",
    name: "X",
    color: "#000000",
    bgColor: "#F5F5F5",
    icon: Twitter,
    domains: ["twitter.com", "x.com"],
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    bgColor: "#F0F6FC",
    icon: Linkedin,
    domains: ["linkedin.com"],
  },
  medium: {
    id: "medium",
    name: "Medium",
    color: "#000000",
    bgColor: "#F5F5F5",
    icon: MediumIcon as unknown as LucideIcon,
    domains: ["medium.com"],
  },
  website: {
    id: "website",
    name: "Website",
    color: "#6B7B6E",
    bgColor: "#F4F6F4",
    icon: Globe,
    domains: [],
  },
};

export function detectPlatform(url: string): Platform {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    for (const [platform, config] of Object.entries(PLATFORMS)) {
      if (config.domains.some((d) => hostname.includes(d))) {
        return platform as Platform;
      }
    }
  } catch {
    // invalid URL
  }
  return "website";
}

export function getPlatformConfig(platform: Platform): PlatformConfig {
  return PLATFORMS[platform] ?? PLATFORMS.website;
}

export const THEMES = [
  "AI",
  "Startup",
  "Marketing",
  "Productivity",
  "Design",
  "Fitness",
  "Finance",
  "Health",
] as const;

export type Theme = (typeof THEMES)[number];
