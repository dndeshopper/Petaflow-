"use client";

import { useRouter } from "next/navigation";
import { s } from "@/lib/export-style";
import { PageHeader, SearchBell } from "@/components/export-ui/Header";
import { gardenTopicsToExport } from "@/lib/export-ui/adapters";
import type { GardenTopic } from "@/lib/types";

const Flower = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 40 40">
    <g fill={color}>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="20" cy="11" rx="5" ry="8.5" transform={`rotate(${r} 20 20)`} />
      ))}
    </g>
    <circle cx="20" cy="20" r="3.6" fill="#fff" />
  </svg>
);

interface ExportGardenProps {
  topics: GardenTopic[];
}

export function ExportGarden({ topics }: ExportGardenProps) {
  const router = useRouter();
  const gardenThemes = gardenTopicsToExport(topics);

  return (
    <>
      <PageHeader title="Garden" subtitle="Your themes, grown from everything you save" right={<SearchBell />} />

      <div style={s("flex:1; overflow-y:auto; padding:8px 40px 60px;")}>
        <div style={s("display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; max-width:1100px;")}>
          {gardenThemes.map((t) => (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/timeline?theme=${encodeURIComponent(t.name)}`)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/timeline?theme=${encodeURIComponent(t.name)}`)}
              style={s(`border:1px solid #ededeb; border-radius:18px; padding:22px; background:${t.bg}; position:relative; overflow:hidden; min-height:200px; display:flex; flex-direction:column; cursor:pointer;`)}
            >
              <div style={s("display:flex; align-items:flex-start; justify-content:space-between;")}>
                <div>
                  <div style={s("font-size:17px; font-weight:700; letter-spacing:-0.3px;")}>{t.name}</div>
                  <div style={s("font-size:13px; color:#7c7a76; margin-top:3px;")}>{t.count} petals · {t.growth}</div>
                </div>
                <span style={s("width:34px; height:34px; border-radius:10px; background:rgba(255,255,255,0.6); display:flex; align-items:center; justify-content:center;")}>
                  <Flower color={t.flower} />
                </span>
              </div>
              <div style={s("flex:1;")} />
              <div style={s("display:flex; align-items:flex-end; gap:4px; height:42px; margin-top:18px;")}>
                {t.bars.map((b, i) => (
                  <div key={i} style={s(`flex:1; height:${b.h}; background:${b.c}; border-radius:3px;`)} />
                ))}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/timeline?theme=${encodeURIComponent(t.name)}`);
                }}
                style={s("display:flex; align-items:center; gap:6px; margin-top:14px; font-size:13px; font-weight:600; color:#3f3d3a; background:none; border:none; cursor:pointer; padding:0;")}
              >
                Tend garden
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3f3d3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => router.push("/inbox")}
            style={s("border:1.5px dashed #dcdbd8; border-radius:18px; padding:22px; background:#fcfcfb; min-height:200px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; cursor:pointer;")}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9a9893" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            <div style={s("font-size:14.5px; font-weight:600;")}>Plant a new theme</div>
            <div style={s("font-size:12.5px; color:#a7a5a1; text-align:center;")}>Group petals into a growing collection</div>
          </button>
        </div>
      </div>
    </>
  );
}
