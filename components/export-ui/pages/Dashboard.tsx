"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { s } from "@/lib/export-style";
import { SearchBell } from "@/components/export-ui/Header";
import { usePetals } from "@/components/petals/petals-provider";
import { AddPetalDialog } from "@/components/petals/add-petal-dialog";
import { PetalCardLink, PetalThumb } from "@/components/export-ui/PetalCardLink";
import { PetalDeleteButton } from "@/components/export-ui/PetalDeleteButton";
import { PetalTitleDisplay } from "@/components/export-ui/PetalTitleDisplay";
import { getTimeGreeting } from "@/lib/utils";
import {
  getTodayPetals,
  petalToTimelineItem,
  todayOverview,
} from "@/lib/export-ui/adapters";
import { getDailyQuote } from "@/lib/demo-data";
import type { TodayStats, UserProfile } from "@/lib/types";

function Row({ side, time, children }: { side: "left" | "right"; time?: string; children: React.ReactNode }) {
  return (
    <div style={s("display:grid; grid-template-columns:1fr 88px 1fr; align-items:center; position:relative; z-index:1; padding:9px 0;")}>
      <div style={s("justify-self:end;")}>{side === "left" && children}</div>
      <div style={s("text-align:center;")}>
        {time && <span style={s("display:inline-block; font-size:12.5px; color:#9a9893; background:#fff; padding:7px 6px;")}>{time}</span>}
      </div>
      <div style={s("justify-self:start;")}>{side === "right" && children}</div>
    </div>
  );
}

const CardShell = ({ w = 330, children }: { w?: number; children: React.ReactNode }) => (
  <div style={s(`width:${w}px; background:#fff; border:1px solid #ededeb; border-radius:16px; box-shadow:0 2px 10px rgba(0,0,0,0.03); padding:15px;`)}>{children}</div>
);

const CardHead = ({ icon, name, time }: { icon: React.ReactNode; name: string; time: string }) => (
  <div style={s("display:flex; align-items:center; gap:9px; margin-bottom:13px;")}>
    {icon}
    <span style={s("font-size:13.5px; font-weight:600; color:#3f3d3a;")}>{name}</span>
    <span style={s("flex:1;")} />
    <span style={s("font-size:13px; color:#a7a5a1;")}>{time}</span>
  </div>
);

function PlatformIcon({ platGlyph, platBg }: { platGlyph: string; platBg: string }) {
  if (platGlyph === "▶") {
    return (
      <span style={s(`width:22px; height:22px; border-radius:6px; background:${platBg}; display:flex; align-items:center; justify-content:center;`)}>
        <svg width="11" height="11" viewBox="0 0 12 12"><path d="M4 3l5 3-5 3z" fill="#fff" /></svg>
      </span>
    );
  }
  if (platGlyph === "◎") {
    return (
      <span style={s(`width:22px; height:22px; border-radius:7px; background:${platBg}; display:flex; align-items:center; justify-content:center;`)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /></svg>
      </span>
    );
  }
  if (platGlyph === "M") {
    return (
      <span style={s(`width:22px; height:22px; border-radius:6px; background:${platBg}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:700; font-family:Georgia,serif;`)}>M</span>
    );
  }
  if (platGlyph === "f") {
    return (
      <span style={s(`width:22px; height:22px; border-radius:6px; background:${platBg}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:15px; font-weight:700; font-family:Georgia,serif;`)}>f</span>
    );
  }
  if (platGlyph === "◍") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6f8fb5" strokeWidth="1.7">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
      </svg>
    );
  }
  return (
    <span style={s(`width:22px; height:22px; border-radius:6px; background:${platBg}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:700;`)}>
      {platGlyph}
    </span>
  );
}

interface ExportDashboardProps {
  user: UserProfile;
  stats: TodayStats;
}

export function ExportDashboard({ stats }: ExportDashboardProps) {
  const { petals, newTodayCount } = usePetals();
  const [addOpen, setAddOpen] = useState(false);
  const todayPetals = getTodayPetals(petals);
  const overview = todayOverview(stats);
  const quote = getDailyQuote();
  const today = new Date();

  return (
    <>
      <header style={s("display:flex; align-items:flex-start; gap:24px; padding:30px 34px 24px 40px;")}>
        <div style={s("flex:1; min-width:0;")}>
          <h1 style={s("margin:0; font-size:28px; font-weight:700; letter-spacing:-0.7px;")}>{getTimeGreeting()}</h1>
          <div style={s("font-size:14.5px; color:#9a9893; margin-top:7px;")}>
            You have {newTodayCount} new petal{newTodayCount !== 1 ? "s" : ""} today
          </div>
        </div>
        <SearchBell />
      </header>

      <div style={s("display:flex; gap:0; padding:0 0 40px 40px; flex:1;")}>
        <div style={s("flex:1; min-width:0; position:relative;")}>
          <div style={s("display:flex; align-items:center; justify-content:center; gap:32px; margin-bottom:8px;")}>
            <button type="button" style={s("width:34px; height:34px; border:none; background:none; border-radius:9px; cursor:pointer; display:flex; align-items:center; justify-content:center;")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8884" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6-6 6 6 6" /></svg>
            </button>
            <div style={s("text-align:center;")}>
              <div style={s("font-size:17px; font-weight:700; letter-spacing:-0.3px;")}>{format(today, "d MMMM yyyy")}</div>
              <div style={s("font-size:13px; color:#a7a5a1; margin-top:2px;")}>{format(today, "EEEE")}</div>
            </div>
            <button type="button" style={s("width:34px; height:34px; border:none; background:none; border-radius:9px; cursor:pointer; display:flex; align-items:center; justify-content:center;")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8884" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 6 6 6-6 6" /></svg>
            </button>
          </div>

          <div style={s("max-width:900px; margin:0 auto;")}>
            <div style={s("display:flex; justify-content:center; margin-bottom:2px;")}>
              <svg width="22" height="26" viewBox="0 0 22 26"><path d="M11 26V11" stroke="#c5c1f0" strokeWidth="1.4" /><ellipse cx="11" cy="6" rx="5" ry="6.5" fill="#6c5ce7" /><path d="M11 11c-2-1-3.5-3-3.5-5" stroke="#c5c1f0" strokeWidth="1.2" fill="none" /></svg>
            </div>

            <div style={s("position:relative;")}>
              <div style={s("position:absolute; left:50%; top:0; bottom:0; width:1.5px; transform:translateX(-50%); background:#d6d3f3; z-index:0;")} />

              {todayPetals.map((petal, index) => {
                const item = petalToTimelineItem(petal);
                const side = index % 2 === 0 ? "left" : "right";
                const w = side === "left" ? 330 : 340;
                const showThumb = item.thumbImageUrl || item.thumbLabel;
                return (
                  <Row key={petal.id} side={side as "left" | "right"} time={item.time}>
                    <CardShell w={w}>
                      <CardHead name={item.platform} time={item.time} icon={<PlatformIcon platGlyph={item.platGlyph} platBg={item.platBg} />} />
                      <div style={s("display:flex; gap:13px; align-items:flex-start;")}>
                        <PetalCardLink url={item.url} style={{ flex: 1, minWidth: 0 }}>
                          <div style={s("display:flex; gap:13px; align-items:flex-start;")}>
                            {showThumb && (
                              <PetalThumb
                                thumbBg={item.thumbBg}
                                thumbImageUrl={item.thumbImageUrl}
                                thumbLabel={item.thumbLabel}
                                width={96}
                                height={62}
                              />
                            )}
                            <div style={s("flex:1; min-width:0;")}>
                              <PetalTitleDisplay title={item.title} platformId={item.platformId} />
                              <span style={s(`display:inline-block; margin-top:10px; font-size:12px; color:${item.tagColor}; background:${item.tagBg}; border-radius:7px; padding:4px 9px; font-weight:500;`)}>{item.tag}</span>
                            </div>
                          </div>
                        </PetalCardLink>
                        <PetalDeleteButton petalId={petal.id} title={petal.title} />
                      </div>
                    </CardShell>
                  </Row>
                );
              })}

              <Row side="left">
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  style={s("width:330px; border:1.5px dashed #dcdbd8; border-radius:16px; padding:26px 15px; text-align:center; cursor:pointer; background:#fcfcfb;")}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9a9893" strokeWidth="2" strokeLinecap="round" style={{ marginBottom: 8 }}>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <div style={s("font-size:14.5px; font-weight:600;")}>Add a new petal</div>
                  <div style={s("font-size:12.5px; color:#a7a5a1; margin-top:5px;")}>Click the extension or drag link here</div>
                </button>
              </Row>
            </div>

            <div style={s("display:flex; justify-content:center; margin-top:2px;")}>
              <svg width="26" height="22" viewBox="0 0 26 22"><path d="M13 0v14" stroke="#8b7ff0" strokeWidth="1.4" /><path d="M13 14c-6 0-9-4-9-9 5 0 9 4 9 9Z" fill="#8b7ff0" /><path d="M13 11c5 0 8-3.5 8-8-4.5 0-8 3.5-8 8Z" fill="#a99cf0" /></svg>
            </div>
          </div>
        </div>

        <aside style={s("width:300px; flex:none; padding:0 34px 0 28px; display:flex; flex-direction:column; gap:18px;")}>
          <div style={s("border:1px solid #ededeb; border-radius:16px; padding:18px;")}>
            <div style={s("font-size:14.5px; font-weight:700; margin-bottom:18px;")}>Today overview</div>
            <div style={s("display:flex; gap:14px; margin-bottom:18px;")}>
              <div style={s("flex:1;")}>
                <div style={s("font-size:28px; font-weight:700; letter-spacing:-1px;")}>{overview.petalsSaved}</div>
                <div style={s("font-size:12.5px; color:#9a9893; margin-top:2px;")}>Petals saved</div>
              </div>
              <div style={s("flex:1;")}>
                <div style={s("font-size:28px; font-weight:700; letter-spacing:-1px;")}>{overview.minutesToWatch}<span style={s("font-size:18px;")}>m</span></div>
                <div style={s("font-size:12.5px; color:#9a9893; margin-top:2px;")}>To watch later</div>
              </div>
            </div>
            <div style={s("display:flex; align-items:flex-end; gap:3px; height:46px; margin-bottom:8px;")}>
              {[30, 55, 40, 65, 48, 80, 100, 60, 45, 72, 38, 55, 30, 42, 25].map((h, i) => (
                <div key={i} style={s(`flex:1; height:${h}%; background:${h === 100 ? "#6c5ce7" : "#e6e4e0"}; border-radius:2px;`)} />
              ))}
            </div>
            <div style={s("display:flex; justify-content:space-between; font-size:11px; color:#b3b1ad; margin-bottom:15px;")}>
              {["00", "04", "08", "12", "16", "20", "24"].map((t) => <span key={t}>{t}</span>)}
            </div>
            <Link href="/timeline" style={s("display:flex; align-items:center; gap:7px; font-size:13.5px; font-weight:600; color:#1c1b1a; text-decoration:none;")}>
              View full analytics
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1c1b1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          </div>

          <div style={s("border:1px solid #ededeb; border-radius:16px; padding:18px;")}>
            <div style={s("font-size:14.5px; font-weight:700; margin-bottom:16px;")}>Top themes today</div>
            <div style={s("display:flex; flex-direction:column; gap:13px;")}>
              {overview.topThemes.map((theme) => (
                <div key={theme.name} style={s("display:flex; align-items:center; gap:10px; font-size:14px;")}>
                  <span style={s(`width:9px; height:9px; border-radius:50%; background:${theme.color};`)} />
                  <span style={s("flex:1; color:#3f3d3a;")}>{theme.name}</span>
                  <span style={s("color:#9a9893; font-weight:600;")}>{theme.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s("border:1px solid #ededeb; border-radius:16px; padding:18px;")}>
            <div style={s("font-size:14.5px; font-weight:700; margin-bottom:16px;")}>Recent collections</div>
            <div style={s("display:flex; flex-direction:column; gap:14px; margin-bottom:16px;")}>
              {overview.recentCollections.map((c) => (
                <div key={c.name} style={s("display:flex; align-items:center; gap:12px;")}>
                  <span style={s(`width:34px; height:34px; border-radius:9px; background:${c.bg}; flex:none;`)} />
                  <div style={s("line-height:1.25;")}>
                    <div style={s("font-size:14px; font-weight:600;")}>{c.name}</div>
                    <div style={s("font-size:12px; color:#9a9893;")}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/collections" style={s("display:flex; align-items:center; gap:7px; font-size:13.5px; font-weight:600; color:#1c1b1a; text-decoration:none;")}>
              View all collections
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1c1b1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          </div>

          <div style={s("border:1px solid #ededeb; border-radius:16px; padding:18px; position:relative; overflow:hidden;")}>
            <div style={s("font-size:26px; color:#cfceca; font-family:Georgia,serif; line-height:0.6; margin-bottom:10px;")}>&ldquo;</div>
            <div style={s("font-size:13.5px; color:#6f6d69; line-height:1.5; max-width:200px;")}>{quote.text}</div>
            <svg width="90" height="90" viewBox="0 0 90 90" style={{ position: "absolute", right: -6, bottom: -6, opacity: 0.5 }}>
              <g fill="none" stroke="#d9d4f7" strokeWidth="1.3">
                <ellipse cx="55" cy="40" rx="7" ry="14" transform="rotate(30 55 40)" />
                <ellipse cx="62" cy="48" rx="7" ry="14" transform="rotate(70 62 48)" />
                <ellipse cx="60" cy="58" rx="7" ry="14" transform="rotate(110 60 58)" />
                <ellipse cx="50" cy="55" rx="7" ry="14" transform="rotate(150 50 55)" />
                <path d="M48 60 Q40 75 30 82" />
              </g>
            </svg>
          </div>
        </aside>
      </div>

      <AddPetalDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
