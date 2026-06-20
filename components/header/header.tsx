"use client";

import { Menu } from "lucide-react";
import { design } from "@/lib/design-tokens";
import { getTimeGreeting } from "@/lib/utils";

import { useGlobalSearch } from "@/components/search/search-provider";

interface HeaderProps {
  userName: string;
  newPetalsCount: number;
  onMenuClick?: () => void;
}

export function Header({ userName: _userName, newPetalsCount, onMenuClick }: HeaderProps) {
  const { openSearch } = useGlobalSearch();

  return (
    <header
      className="flex flex-col gap-4 px-4 pb-5 pt-6 sm:px-6 lg:flex-row lg:items-start lg:gap-6 lg:px-8 lg:pb-6 lg:pt-8 xl:pl-10"
      style={{ fontFamily: design.font }}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border bg-white lg:hidden"
          style={{ borderColor: design.colors.borderInput }}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} style={{ color: design.colors.textNav }} />
        </button>
        <div className="min-w-0 flex-1">
          <h1
            className="m-0 text-[22px] font-bold tracking-tight sm:text-[26px] xl:text-[28px]"
            style={{
              letterSpacing: "-0.7px",
              color: design.colors.text,
            }}
          >
            {getTimeGreeting()}
          </h1>
          <div
            className="mt-1.5 text-sm sm:text-[14.5px]"
            style={{ color: design.colors.textMuted }}
          >
            You have {newPetalsCount} new petals today
          </div>
        </div>
      </div>

      <div className="flex w-full items-center gap-3 sm:gap-4 lg:w-auto lg:shrink-0 lg:pt-1.5">
        <button
          type="button"
          onClick={openSearch}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[13px] border px-3 py-2.5 sm:px-3.5 sm:py-[11px] lg:w-[260px] lg:flex-none xl:w-[290px]"
          style={{
            background: design.colors.bgMuted,
            borderColor: design.colors.borderInput,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a7a5a1" strokeWidth="1.9" strokeLinecap="round" className="shrink-0">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4-4" />
          </svg>
          <span className="min-w-0 flex-1 truncate text-left text-sm" style={{ color: design.colors.textLight }}>
            Search petals...
          </span>
          <span
            className="hidden shrink-0 rounded-md border px-[7px] py-0.5 text-[11.5px] font-medium sm:inline"
            style={{ color: "#b3b1ad", borderColor: "#e2e1de" }}
          >
            ⌘ K
          </span>
        </button>
        <button
          type="button"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border bg-white sm:h-11 sm:w-11"
          style={{ borderColor: design.colors.borderInput }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5b5955" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
            <path d="M13.5 19a2 2 0 0 1-3 0" />
          </svg>
          <span
            className="absolute rounded-full border-[1.5px] border-white"
            style={{
              top: 10,
              right: 11,
              width: 7,
              height: 7,
              background: design.colors.accent,
            }}
          />
        </button>
      </div>
    </header>
  );
}
