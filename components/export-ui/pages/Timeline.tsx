"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { s } from "@/lib/export-style";
import { PageHeader, SearchBell } from "@/components/export-ui/Header";
import { usePetals } from "@/components/petals/petals-provider";
import { buildTimelineDays, buildTimelineFilters } from "@/lib/export-ui/adapters";
import { PetalCardLink, PetalThumb } from "@/components/export-ui/PetalCardLink";

const Bookmark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4c2be" strokeWidth="1.8" style={{ flex: "none" }}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </svg>
);

export function ExportTimeline() {
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const { petals } = usePetals();
  const [active, setActive] = useState(themeParam ?? "All");
  const timelineFilters = useMemo(() => buildTimelineFilters(petals), [petals]);
  const timelineDays = useMemo(
    () => buildTimelineDays(petals, active),
    [petals, active]
  );

  return (
    <>
      <PageHeader title="Timeline" subtitle="Everything you've saved, in order" right={<SearchBell />} />

      <div style={s("display:flex; align-items:center; gap:10px; padding:0 34px 22px 40px;")}>
        {timelineFilters.map((f) => {
          const on = f.label === active;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => setActive(f.label)}
              style={s(
                `display:flex; align-items:center; gap:8px; border:1px solid ${on ? "#1c1b1a" : "#eeedeb"}; background:${on ? "#1c1b1a" : "#fff"}; color:${on ? "#fff" : "#5b5955"}; border-radius:11px; padding:8px 13px; cursor:pointer; font-size:13.5px; font-weight:600; white-space:nowrap;`
              )}
            >
              {f.dot && <span style={s(`width:8px; height:8px; border-radius:50%; background:${f.dot}; flex:none;`)} />}
              {f.label}
              <span style={s(`font-size:12px; font-weight:600; color:${on ? "rgba(255,255,255,0.65)" : "#b3b1ad"};`)}>{f.count}</span>
            </button>
          );
        })}
        <div style={s("flex:1;")} />
        <button type="button" style={s("display:flex; align-items:center; gap:8px; border:1px solid #eeedeb; background:#fff; border-radius:11px; padding:9px 14px; cursor:pointer; font-size:13.5px; font-weight:600; color:#5b5955;")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8884" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M6 12h12M10 18h4" /></svg>
          Newest first
        </button>
      </div>

      <div style={s("flex:1; overflow-y:auto; padding:0 40px 60px;")}>
        <div style={s("max-width:680px; margin:0 auto; position:relative;")}>
          <div style={s("position:absolute; left:7px; top:6px; bottom:10px; width:2px; background:linear-gradient(#e2dff3,#ece9f7); border-radius:2px;")} />

          {timelineDays.map((day) => (
            <div key={`${day.label}-${day.sub}`} style={s("position:relative;")}>
              <div style={s("display:flex; align-items:center; gap:14px; padding:22px 0 16px;")}>
                <span style={s(`width:16px; height:16px; border-radius:50%; background:${day.dotColor}; border:3px solid #fff; box-shadow:0 0 0 1.5px ${day.ringColor}; flex:none; z-index:1;`)} />
                <span style={s("font-size:16px; font-weight:700; letter-spacing:-0.3px;")}>{day.label}</span>
                <span style={s("font-size:13px; color:#a7a5a1;")}>{day.sub}</span>
                <span style={s("flex:1;")} />
                <span style={s("font-size:12.5px; color:#9a9893; background:#f5f4f2; border-radius:20px; padding:4px 11px; font-weight:600;")}>{day.count} petals</span>
              </div>

              <div style={s("padding-left:34px; display:flex; flex-direction:column; gap:11px; padding-bottom:8px;")}>
                {day.items.map((it) => (
                  <PetalCardLink key={it.id} url={it.url}>
                    <div style={s("position:relative; background:#fff; border:1px solid #ededeb; border-radius:15px; box-shadow:0 2px 9px rgba(0,0,0,0.03); padding:14px 15px;")}>
                      <span style={s(`position:absolute; left:-30px; top:24px; width:8px; height:8px; border-radius:50%; background:#fff; border:2px solid ${it.accent}; z-index:1;`)} />
                      <div style={s("display:flex; align-items:center; gap:13px;")}>
                        <PetalThumb
                          thumbBg={it.thumbBg}
                          thumbImageUrl={it.thumbImageUrl}
                          thumbLabel={it.thumbLabel}
                          width={80}
                          height={54}
                        />
                        <div style={s("flex:1; min-width:0;")}>
                          <div style={s("display:flex; align-items:center; gap:8px; margin-bottom:6px;")}>
                            <span style={s(`width:18px; height:18px; border-radius:5px; background:${it.platBg}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:700; flex:none;`)}>{it.platGlyph}</span>
                            <span style={s("font-size:12.5px; font-weight:600; color:#6f6d69; white-space:nowrap;")}>{it.platform}</span>
                            <span style={s("width:3px; height:3px; border-radius:50%; background:#cfcdc9; flex:none;")} />
                            <span style={s("font-size:12.5px; color:#a7a5a1; white-space:nowrap;")}>{it.time}</span>
                          </div>
                          <div style={s("font-size:14.5px; font-weight:600; line-height:1.3; color:#1c1b1a; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;")}>{it.title}</div>
                          <span style={s(`display:inline-block; margin-top:8px; font-size:11.5px; font-weight:500; border-radius:6px; padding:3px 8px; color:${it.tagColor}; background:${it.tagBg};`)}>{it.tag}</span>
                        </div>
                        <Bookmark />
                      </div>
                    </div>
                  </PetalCardLink>
                ))}
              </div>
            </div>
          ))}

          <div style={s("position:relative; display:flex; align-items:center; gap:14px; padding:22px 0 10px;")}>
            <span style={s("width:16px; height:16px; border-radius:50%; background:#fff; border:2px solid #d6d3f3; flex:none; z-index:1; display:flex; align-items:center; justify-content:center;")}>
              <span style={s("width:5px; height:5px; border-radius:50%; background:#bdb6ee;")} />
            </span>
            <span style={s("font-size:13.5px; color:#a7a5a1;")}>You&apos;ve reached the beginning of your garden</span>
          </div>
        </div>
      </div>
    </>
  );
}
