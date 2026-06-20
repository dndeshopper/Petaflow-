"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { s } from "@/lib/export-style";
import { petalToSearchResult } from "@/lib/export-ui/adapters";
import { PetalThumb } from "@/components/export-ui/PetalCardLink";
import { PetalTitleDisplay } from "@/components/export-ui/PetalTitleDisplay";
import { PETALS_CHANGED_EVENT } from "@/lib/sync-events";
import type { Petal, Platform } from "@/lib/types";

const PLATFORM_CHIPS: { label: string; platform?: Platform; dot: string | null }[] = [
  { label: "All platforms", dot: null },
  { label: "YouTube", platform: "youtube", dot: "#ff0000" },
  { label: "Instagram", platform: "instagram", dot: "#E4405F" },
  { label: "Facebook", platform: "facebook", dot: "#1877F2" },
  { label: "X", platform: "x", dot: "#000" },
];

export function ExportSearch() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [activePlatform, setActivePlatform] = useState<string>("All platforms");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof petalToSearchResult>[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        const chip = PLATFORM_CHIPS.find((c) => c.label === activePlatform);
        if (chip?.platform) params.set("platform", chip.platform);
        if (unreadOnly) params.set("viewed", "false");
        params.set("limit", "50");

        const res = await fetch(`/api/search?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        const petals = (data.petals ?? []) as Petal[];
        setResults(petals.map(petalToSearchResult));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activePlatform, unreadOnly]);

  useEffect(() => {
    const onPetalsChanged = () => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      const chip = PLATFORM_CHIPS.find((c) => c.label === activePlatform);
      if (chip?.platform) params.set("platform", chip.platform);
      if (unreadOnly) params.set("viewed", "false");
      params.set("limit", "50");

      void fetch(`/api/search?${params.toString()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          const petals = (data.petals ?? []) as Petal[];
          setResults(petals.map(petalToSearchResult));
        })
        .catch(() => undefined);
    };

    window.addEventListener(PETALS_CHANGED_EVENT, onPetalsChanged);
    return () => window.removeEventListener(PETALS_CHANGED_EVENT, onPetalsChanged);
  }, [query, activePlatform, unreadOnly]);

  const chips = useMemo(() => {
    const base = PLATFORM_CHIPS.map((c) => ({
      label: c.label,
      dot: c.dot,
      on: c.label === activePlatform,
      onClick: () => setActivePlatform(c.label),
    }));
    return [
      ...base,
      {
        label: "Unread",
        dot: null,
        on: unreadOnly,
        onClick: () => setUnreadOnly((v) => !v),
      },
    ];
  }, [activePlatform, unreadOnly]);

  return (
    <div style={s("flex:1; overflow-y:auto; padding:54px 40px 60px;")}>
      <div style={s("max-width:760px; margin:0 auto;")}>
        <h1 style={s("margin:0 0 4px; font-size:30px; font-weight:700; letter-spacing:-0.8px;")}>Search your garden</h1>
        <div style={s("font-size:14.5px; color:#9a9893; margin-bottom:26px;")}>Find any petal across every platform and theme</div>

        <div style={s("display:flex; align-items:center; gap:13px; background:#fff; border:1.5px solid #1c1b1a; border-radius:16px; padding:16px 18px; box-shadow:0 4px 18px rgba(108,92,231,0.08);")}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#1c1b1a" strokeWidth="1.9" strokeLinecap="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search petals..."
            style={s("font-size:16.5px; color:#1c1b1a; flex:1; border:none; outline:none; background:transparent;")}
            autoFocus
          />
          <span style={s("font-size:11.5px; color:#b3b1ad; border:1px solid #e2e1de; border-radius:6px; padding:3px 8px; font-weight:500;")}>esc</span>
        </div>

        <div style={s("display:flex; align-items:center; gap:9px; margin:18px 0 30px; flex-wrap:wrap;")}>
          <span style={s("font-size:12.5px; color:#a7a5a1; font-weight:600; margin-right:2px;")}>Filter</span>
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={c.onClick}
              style={s(`display:flex; align-items:center; gap:7px; border:1px solid ${c.on ? "#1c1b1a" : "#eeedeb"}; background:${c.on ? "#1c1b1a" : "#fff"}; color:${c.on ? "#fff" : "#5b5955"}; border-radius:10px; padding:7px 12px; font-size:13px; font-weight:600; cursor:pointer;`)}
            >
              {c.dot && <span style={s(`width:7px; height:7px; border-radius:50%; background:${c.dot};`)} />}
              {c.label}
            </button>
          ))}
        </div>

        <div style={s("display:flex; align-items:baseline; justify-content:space-between; margin-bottom:14px;")}>
          <span style={s("font-size:14.5px; font-weight:700;")}>
            {loading ? "Searching..." : `${results.length} result${results.length !== 1 ? "s" : ""}`}
          </span>
          <span style={s("font-size:13px; color:#a7a5a1;")}>Sorted by relevance</span>
        </div>

        <div style={s("display:flex; flex-direction:column; gap:11px;")}>
          {results.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              style={s("display:flex; align-items:center; gap:15px; background:#fff; border:1px solid #ededeb; border-radius:14px; box-shadow:0 2px 9px rgba(0,0,0,0.03); padding:14px 16px; cursor:pointer; text-decoration:none; color:inherit;")}
            >
              <PetalThumb
                thumbBg={r.thumbBg}
                thumbImageUrl={r.thumbImageUrl}
                thumbLabel={r.thumbLabel}
                width={88}
                height={56}
              />
              <div style={s("flex:1; min-width:0;")}>
                <div style={s("display:flex; align-items:center; gap:8px; margin-bottom:5px;")}>
                  <span style={s(`width:18px; height:18px; border-radius:5px; background:${r.platBg}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:700; flex:none;`)}>{r.platGlyph}</span>
                  <span style={s("font-size:12.5px; font-weight:600; color:#6f6d69; white-space:nowrap;")}>{r.platform}</span>
                  <span style={s("width:3px; height:3px; border-radius:50%; background:#cfcdc9; flex:none;")} />
                  <span style={s("font-size:12.5px; color:#a7a5a1; white-space:nowrap;")}>{r.date}</span>
                </div>
                <PetalTitleDisplay title={r.title} platformId={r.platformId} />
              </div>
              <span style={s(`font-size:11.5px; font-weight:500; border-radius:6px; padding:3px 8px; color:${r.tagColor}; background:${r.tagBg}; flex:none;`)}>{r.tag}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
