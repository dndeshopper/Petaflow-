"use client";

import Link from "next/link";
import { design, hourlyChartHeights } from "@/lib/design-tokens";
import { ArrowRightIcon, QuoteFlowerArt } from "@/components/ui/design-icons";
import { getDailyQuote } from "@/lib/demo-data";
import type { TodayStats } from "@/lib/types";

interface InsightPanelProps {
  stats: TodayStats;
}

const themeDots: Record<string, string> = {
  "AI & Automation": "#6c5ce7",
  Productivity: "#9b7ff0",
  Design: "#b9a3f0",
};

const collectionColors: Record<string, string> = {
  "Project Splitto": "#e3ddf8",
  Inspiration: "#ead9f1",
};

export function InsightPanel({ stats }: InsightPanelProps) {
  const quote = getDailyQuote();

  return (
    <aside
      className="grid w-full shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-none lg:grid-cols-1 lg:gap-[18px] xl:w-[300px]"
      style={{
        padding: "0 0 0 0",
        fontFamily: design.font,
      }}
    >
      <div className="rounded-2xl border p-[18px] sm:col-span-2 lg:col-span-1 xl:px-7" style={{ borderColor: design.colors.borderCard }}>
        <div className="mb-[18px] text-[14.5px] font-bold" style={{ color: design.colors.text }}>
          Today overview
        </div>
        <div className="mb-[18px] flex gap-3.5">
          <div className="flex-1">
            <div className="text-2xl font-bold tracking-tight sm:text-[28px]" style={{ color: design.colors.text }}>
              {stats.petals_saved}
            </div>
            <div className="mt-0.5 text-[12.5px]" style={{ color: design.colors.textMuted }}>
              Petals saved
            </div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold tracking-tight text-black sm:text-[28px]">
              {stats.minutes_to_watch}
              <span className="text-lg">m</span>
            </div>
            <div className="mt-0.5 text-[12.5px]" style={{ color: design.colors.textMuted }}>
              To watch later
            </div>
          </div>
        </div>

        <div className="mb-2 flex h-[46px] items-end gap-[3px]">
          {hourlyChartHeights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                background: h === 100 ? design.colors.chartBarActive : design.colors.chartBar,
              }}
            />
          ))}
        </div>
        <div className="mb-[15px] flex justify-between text-[11px]" style={{ color: "#b3b1ad" }}>
          {["00", "04", "08", "12", "16", "20", "24"].map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-[7px] text-[13.5px] font-semibold no-underline"
          style={{ color: design.colors.text }}
        >
          View full analytics <ArrowRightIcon />
        </Link>
      </div>

      <div className="rounded-2xl border p-[18px] xl:px-7" style={{ borderColor: design.colors.borderCard }}>
        <div className="mb-4 text-[14.5px] font-bold" style={{ color: design.colors.text }}>
          Top themes today
        </div>
        <div className="flex flex-col gap-[13px]">
          {stats.top_themes.map((theme) => (
            <div key={theme.name} className="flex items-center gap-2.5 text-sm">
              <span
                className="h-[9px] w-[9px] rounded-full"
                style={{ background: themeDots[theme.name] ?? "#6c5ce7" }}
              />
              <span className="flex-1" style={{ color: design.colors.textSecondary }}>
                {theme.name}
              </span>
              <span className="font-semibold" style={{ color: design.colors.textMuted }}>
                {theme.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-[18px] xl:px-7" style={{ borderColor: design.colors.borderCard }}>
        <div className="mb-4 text-[14.5px] font-bold" style={{ color: design.colors.text }}>
          Recent collections
        </div>
        <div className="mb-4 flex flex-col gap-3.5">
          {stats.recent_collections.map((c) => (
            <Link key={c.id} href="/collections" className="flex items-center gap-3 no-underline">
              <span
                className="h-[34px] w-[34px] shrink-0 rounded-[9px]"
                style={{ background: collectionColors[c.name] ?? c.color }}
              />
              <div className="leading-tight">
                <div className="text-sm font-semibold" style={{ color: design.colors.text }}>
                  {c.name}
                </div>
                <div className="text-xs" style={{ color: design.colors.textMuted }}>
                  {c.petal_count} petals
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link
          href="/collections"
          className="flex items-center gap-[7px] text-[13.5px] font-semibold no-underline"
          style={{ color: design.colors.text }}
        >
          View all collections <ArrowRightIcon />
        </Link>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border p-[18px] sm:col-span-2 lg:col-span-1 xl:px-7"
        style={{ borderColor: design.colors.borderCard }}
      >
        <div className="mb-2.5 font-serif leading-none" style={{ fontSize: 26, color: "#cfceca" }}>
          &ldquo;
        </div>
        <div className="max-w-none text-[13.5px] leading-normal sm:max-w-[200px]" style={{ color: design.colors.textNav }}>
          {quote.text}
        </div>
        <QuoteFlowerArt />
      </div>
    </aside>
  );
}
