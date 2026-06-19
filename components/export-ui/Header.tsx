"use client";

import type { ReactNode } from "react";
import { s } from "@/lib/export-style";
import { useGlobalSearch } from "@/components/search/search-provider";

interface SearchBellProps {
  placeholder?: string;
  showKbd?: boolean;
  onClick?: () => void;
}

export function SearchBell({
  placeholder = "Search petals...",
  showKbd = true,
  onClick,
}: SearchBellProps) {
  const search = useGlobalSearch();

  return (
    <div style={s("display:flex; align-items:center; gap:16px; padding-top:6px;")}>
      <button
        type="button"
        onClick={onClick ?? search.openSearch}
        style={s(
          "display:flex; align-items:center; gap:10px; width:290px; background:#f5f4f2; border:1px solid #eeedeb; border-radius:13px; padding:11px 14px; cursor:pointer; text-align:left;"
        )}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a7a5a1" strokeWidth="1.9" strokeLinecap="round">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4-4" />
        </svg>
        <span style={s("font-size:14px; color:#a7a5a1; flex:1;")}>{placeholder}</span>
        {showKbd && (
          <span style={s("font-size:11.5px; color:#b3b1ad; border:1px solid #e2e1de; border-radius:6px; padding:2px 7px; font-weight:500;")}>
            ⌘ K
          </span>
        )}
      </button>
      <button
        type="button"
        style={s(
          "position:relative; width:44px; height:44px; border:1px solid #eeedeb; background:#fff; border-radius:13px; cursor:pointer; display:flex; align-items:center; justify-content:center;"
        )}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5b5955" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
          <path d="M13.5 19a2 2 0 0 1-3 0" />
        </svg>
        <span style={s("position:absolute; top:11px; right:12px; width:7px; height:7px; border-radius:50%; background:#6c5ce7; border:1.5px solid #fff;")} />
      </button>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <header style={s("display:flex; align-items:flex-start; gap:24px; padding:30px 40px 22px 40px;")}>
      <div style={s("flex:1; min-width:0;")}>
        <h1 style={s("margin:0; font-size:28px; font-weight:700; letter-spacing:-0.7px;")}>{title}</h1>
        <div style={s("font-size:14.5px; color:#9a9893; margin-top:7px;")}>{subtitle}</div>
      </div>
      {right}
    </header>
  );
}
