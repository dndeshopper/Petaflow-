"use client";

import { useCallback, useMemo, useState } from "react";
import { s } from "@/lib/export-style";
import { PageHeader } from "@/components/export-ui/Header";
import { petalToInboxItem } from "@/lib/export-ui/adapters";
import { PetalCardLink, PetalThumb } from "@/components/export-ui/PetalCardLink";
import { PetalTitleDisplay } from "@/components/export-ui/PetalTitleDisplay";
import { performInboxActionRequest } from "@/lib/inbox/client";
import { notifyPetalsChanged } from "@/lib/sync-events";
import { useInbox } from "@/components/inbox/inbox-provider";
import { usePetals } from "@/components/petals/petals-provider";

const Flower = () => (
  <svg width="18" height="18" viewBox="0 0 40 40">
    <g fill="#d6d3f3">
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="20" cy="11" rx="4.5" ry="8" transform={`rotate(${r} 20 20)`} />
      ))}
    </g>
  </svg>
);

export function ExportInbox() {
  const { decrementCount, refreshCount } = useInbox();
  const { petals } = usePetals();
  const inboxPetals = useMemo(
    () => petals.filter((p) => p.status === "inbox"),
    [petals]
  );
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  const items = useMemo(
    () =>
      inboxPetals
        .filter((p) => !removedIds.has(p.id))
        .map(petalToInboxItem),
    [inboxPetals, removedIds]
  );

  const runAction = useCallback(
    async (petalId: string, action: "mark_viewed" | "archive") => {
      setBusyId(petalId);
      try {
        await performInboxActionRequest(petalId, { action });
        setRemovedIds((prev) => new Set(prev).add(petalId));
        decrementCount();
        await refreshCount();
        notifyPetalsChanged();
      } finally {
        setBusyId(null);
      }
    },
    [decrementCount, refreshCount]
  );

  async function sortAll() {
    for (const item of [...items]) {
      await performInboxActionRequest(item.id, { action: "mark_viewed" });
      setRemovedIds((prev) => new Set(prev).add(item.id));
    }
    await refreshCount();
    notifyPetalsChanged();
  }

  const right = (
    <div style={s("display:flex; align-items:center; gap:12px; padding-top:6px;")}>
      <button
        type="button"
        onClick={sortAll}
        disabled={items.length === 0}
        style={s("display:flex; align-items:center; gap:8px; border:1px solid #eeedeb; background:#fff; border-radius:13px; padding:0 16px; height:44px; cursor:pointer; font-size:14px; font-weight:600; color:#5b5955;")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8884" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        Sort all
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Inbox"
        subtitle={`${items.length} petals waiting to be sorted into your garden`}
        right={right}
      />

      <div style={s("flex:1; overflow-y:auto; padding:8px 40px 60px;")}>
        <div style={s("max-width:880px; display:flex; flex-direction:column; gap:12px;")}>
          {items.map((it) => (
            <div key={it.id} style={s("display:flex; align-items:center; gap:16px; background:#fff; border:1px solid #ededeb; border-radius:16px; box-shadow:0 2px 9px rgba(0,0,0,0.03); padding:16px 18px;")}>
              <span style={s(`width:9px; height:9px; border-radius:50%; background:${it.unreadColor}; flex:none;`)} />
              <PetalCardLink url={it.url} style={{ flex: 1, minWidth: 0 }}>
                <div style={s("display:flex; align-items:center; gap:16px;")}>
                  <PetalThumb
                    thumbBg={it.thumbBg}
                    thumbImageUrl={it.thumbImageUrl}
                    thumbLabel={it.thumbLabel}
                    width={96}
                    height={60}
                  />
                  <div style={s("flex:1; min-width:0;")}>
                    <div style={s("display:flex; align-items:center; gap:8px; margin-bottom:6px;")}>
                      <span style={s(`width:18px; height:18px; border-radius:5px; background:${it.platBg}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:700; flex:none;`)}>{it.platGlyph}</span>
                      <span style={s("font-size:12.5px; font-weight:600; color:#6f6d69; white-space:nowrap;")}>{it.platform}</span>
                      <span style={s("width:3px; height:3px; border-radius:50%; background:#cfcdc9; flex:none;")} />
                      <span style={s("font-size:12.5px; color:#a7a5a1; white-space:nowrap;")}>{it.time}</span>
                    </div>
                    <PetalTitleDisplay title={it.title} platformId={it.platformId} />
                    <div style={s("display:flex; align-items:center; gap:7px; margin-top:9px;")}>
                      <span style={s("font-size:12px; color:#a7a5a1;")}>Suggested:</span>
                      <span style={s(`display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:${it.tagColor}; background:${it.tagBg}; border-radius:7px; padding:3px 9px;`)}>
                        <span style={s(`width:6px; height:6px; border-radius:50%; background:${it.tagColor};`)} />
                        {it.suggestion}
                      </span>
                    </div>
                  </div>
                </div>
              </PetalCardLink>
              <div style={s("display:flex; align-items:center; gap:8px; flex:none;")}>
                <button
                  type="button"
                  disabled={busyId === it.id}
                  onClick={() => runAction(it.id, "mark_viewed")}
                  style={s("display:flex; align-items:center; gap:7px; border:none; background:#1c1b1a; color:#fff; border-radius:11px; padding:9px 14px; cursor:pointer; font-size:13px; font-weight:600;")}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  Keep
                </button>
                <button
                  type="button"
                  disabled={busyId === it.id}
                  onClick={() => runAction(it.id, "archive")}
                  style={s("width:40px; height:38px; border:1px solid #eeedeb; background:#fff; border-radius:11px; cursor:pointer; display:flex; align-items:center; justify-content:center;")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a7a5a1" strokeWidth="1.9" strokeLinecap="round"><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V5h6v2M9 11v5M15 11v5" /></svg>
                </button>
              </div>
            </div>
          ))}

          <div style={s("display:flex; align-items:center; justify-content:center; gap:10px; padding:26px; color:#a7a5a1; font-size:13.5px;")}>
            <Flower />
            {items.length === 0 ? "Inbox zero — nicely tended." : "Sort these and your inbox reaches zero"}
          </div>
        </div>
      </div>
    </>
  );
}
