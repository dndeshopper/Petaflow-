"use client";

import { useState } from "react";
import Image from "next/image";
import { design, getThemeStyle } from "@/lib/design-tokens";
import { getPlatformConfig } from "@/lib/platforms";
import { cn, formatPetalTime } from "@/lib/utils";
import { NoteIcon } from "@/components/ui/design-icons";
import type { Petal } from "@/lib/types";

interface PetalCardProps {
  petal: Petal;
  maxWidth?: number;
  className?: string;
}

function PlatformBadge({ platform }: { platform: Petal["platform"] }) {
  const config = getPlatformConfig(platform);

  if (platform === "youtube") {
    return (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[#ff0000]">
        <svg width="11" height="11" viewBox="0 0 12 12"><path d="M4 3l5 3-5 3z" fill="#fff" /></svg>
      </span>
    );
  }
  if (platform === "instagram") {
    return (
      <span
        className="flex h-[22px] w-[22px] items-center justify-center rounded-[7px]"
        style={{ background: "linear-gradient(135deg,#f9ce5b,#ee583f 45%,#d92e8c 75%,#9b3bc4)" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
          <rect x="4" y="4" width="16" height="16" rx="5" />
          <circle cx="12" cy="12" r="3.6" />
        </svg>
      </span>
    );
  }
  if (platform === "x") {
    return (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-black text-xs font-bold text-white">
        𝕏
      </span>
    );
  }
  if (platform === "medium") {
    return (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-black font-serif text-[13px] font-bold text-white">
        M
      </span>
    );
  }
  if (platform === "facebook") {
    return (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[#1877F2] font-serif text-[15px] font-bold text-white">
        f
      </span>
    );
  }
  if (platform === "tiktok") {
    return (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-black text-xs font-bold text-white">
        ♪
      </span>
    );
  }
  if (platform === "website") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6f8fb5" strokeWidth="1.7">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
      </svg>
    );
  }

  const Icon = config.icon;
  return (
    <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md" style={{ backgroundColor: config.bgColor }}>
      <Icon className="h-3 w-3" style={{ color: config.color }} />
    </span>
  );
}

function PlatformThumbnailFallback({ petal }: { petal: Petal }) {
  const gradients: Record<string, string> = {
    youtube: "linear-gradient(135deg,#2a2540,#4a3d6b)",
    instagram: "linear-gradient(135deg,#d8cdbc,#bcae98)",
    medium: "linear-gradient(135deg,#c9cdc2,#9ba38c)",
    tiktok: "repeating-linear-gradient(45deg,#e9e6e1 0 7px,#f1efeb 7px 14px)",
    website: "linear-gradient(135deg,#cdd4dc,#a7b2bd)",
    x: "linear-gradient(135deg,#1a1a1a,#2d2d2d)",
    linkedin: "linear-gradient(135deg,#1a2a3a,#0a3d6b)",
    facebook: "linear-gradient(135deg,#1a3a6b,#1877F2)",
  };

  const bg = gradients[petal.platform] ?? "#e9e6e1";
  const config = getPlatformConfig(petal.platform);

  return (
    <div
      className="flex h-[62px] w-24 shrink-0 flex-col items-center justify-center rounded-[9px] px-1 text-center"
      style={{ background: bg }}
    >
      <span className="text-[10px] font-bold text-white/90">{config.name}</span>
      <span className="mt-0.5 line-clamp-2 text-[9px] leading-tight text-white/75">
        {petal.title}
      </span>
    </div>
  );
}

function Thumbnail({ petal }: { petal: Petal }) {
  const [imgError, setImgError] = useState(false);

  if (petal.preview_url && !imgError) {
    return (
      <div className="relative h-[62px] w-24 shrink-0 overflow-hidden rounded-[9px]">
        <Image
          src={petal.preview_url}
          alt=""
          fill
          className="object-cover"
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return <PlatformThumbnailFallback petal={petal} />;
}

export function PetalCard({ petal, maxWidth = 340, className }: PetalCardProps) {
  const platform = getPlatformConfig(petal.platform);
  const theme = getThemeStyle(petal.theme);
  const time = formatPetalTime(petal.created_at);
  const isTextOnly = petal.platform === "x" && !petal.preview_url;
  const platformLabel = petal.platform === "x" ? "X (Twitter)" : platform.name;

  return (
    <a
      href={petal.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block w-full rounded-2xl border bg-white p-[15px] no-underline", className)}
      style={{
        maxWidth,
        borderColor: design.colors.borderCard,
        boxShadow: design.card.shadow,
        fontFamily: design.font,
      }}
    >
      <div className="mb-[13px] flex items-center gap-[9px]">
        <PlatformBadge platform={petal.platform} />
        <span className="text-[13.5px] font-semibold" style={{ color: design.colors.textSecondary }}>
          {platformLabel}
        </span>
        <span className="flex-1" />
        <span className="text-[13px]" style={{ color: design.colors.textLight }}>
          {time}
        </span>
      </div>

      <div className="flex items-start gap-[13px]">
        {!isTextOnly && <Thumbnail petal={petal} />}
        <div className="min-w-0 flex-1">
          <div
            className="text-[15px] font-semibold leading-snug"
            style={{ color: design.colors.text, lineHeight: isTextOnly ? 1.35 : 1.3 }}
          >
            {isTextOnly ? petal.title : petal.title}
          </div>
          {theme && (
            <span
              className="mt-2.5 inline-block rounded-[7px] px-[9px] py-1 text-xs font-medium"
              style={{ color: theme.color, background: theme.bg }}
            >
              {theme.label}
            </span>
          )}
        </div>
        <NoteIcon />
      </div>
    </a>
  );
}

export function AddPetalPlaceholder({
  maxWidth = 340,
  className,
  onClick,
}: {
  maxWidth?: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer rounded-2xl border border-dashed bg-[#fcfcfb] px-[15px] py-[26px] text-center",
        className
      )}
      style={{ maxWidth, borderColor: design.colors.borderDashed, fontFamily: design.font }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9a9893" strokeWidth="2" strokeLinecap="round" className="mx-auto mb-2">
        <path d="M12 5v14M5 12h14" />
      </svg>
      <div className="text-[14.5px] font-semibold" style={{ color: design.colors.text }}>
        Add a new petal
      </div>
      <div className="mt-[5px] text-[12.5px]" style={{ color: design.colors.textLight }}>
        Click the extension or drag link here
      </div>
    </button>
  );
}
