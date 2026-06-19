import type { Platform } from "./types";
import {
  Globe,
  Instagram,
  Linkedin,
  type LucideIcon,
  Twitter,
  Youtube,
} from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

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
  facebook: {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    bgColor: "#E7F3FF",
    icon: FacebookIcon as unknown as LucideIcon,
    domains: ["facebook.com", "fb.com", "fb.watch"],
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
