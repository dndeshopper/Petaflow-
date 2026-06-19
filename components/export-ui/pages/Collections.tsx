"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { s } from "@/lib/export-style";
import { PageHeader } from "@/components/export-ui/Header";
import { collectionsToExport } from "@/lib/export-ui/adapters";
import type { Collection } from "@/lib/types";

interface ExportCollectionsProps {
  collections: Collection[];
}

export function ExportCollections({ collections }: ExportCollectionsProps) {
  const [filter, setFilter] = useState("");
  const items = useMemo(() => collectionsToExport(collections), [collections]);
  const filtered = useMemo(
    () =>
      filter.trim()
        ? items.filter(
            (c) =>
              c.name.toLowerCase().includes(filter.toLowerCase()) ||
              c.desc.toLowerCase().includes(filter.toLowerCase())
          )
        : items,
    [items, filter]
  );

  const totalPetals = collections.reduce((sum, c) => sum + c.petal_count, 0);

  function handleNewCollection() {
    const name = window.prompt("Collection name");
    if (!name?.trim()) return;
    alert("Collection creation will be available when Supabase is connected. For now, use inbox → move to collection.");
  }

  const right = (
    <div style={s("display:flex; align-items:center; gap:16px; padding-top:6px;")}>
      <div style={s("display:flex; align-items:center; gap:10px; width:290px; background:#f5f4f2; border:1px solid #eeedeb; border-radius:13px; padding:11px 14px;")}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a7a5a1" strokeWidth="1.9" strokeLinecap="round">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search collections..."
          style={s("font-size:14px; color:#1c1b1a; flex:1; border:none; outline:none; background:transparent;")}
        />
      </div>
      <button
        type="button"
        onClick={handleNewCollection}
        style={s("display:flex; align-items:center; gap:8px; border:none; background:#1c1b1a; color:#fff; border-radius:13px; padding:0 18px; height:44px; cursor:pointer; font-size:14px; font-weight:600;")}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        New
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Collections"
        subtitle={`${collections.length} collections · ${totalPetals} petals organized`}
        right={right}
      />

      <div style={s("flex:1; overflow-y:auto; padding:8px 40px 60px;")}>
        <div style={s("display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; max-width:1100px;")}>
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.id}`}
              style={s("border:1px solid #ededeb; border-radius:18px; overflow:hidden; cursor:pointer; box-shadow:0 2px 9px rgba(0,0,0,0.03); background:#fff; text-decoration:none; color:inherit;")}
            >
              <div style={s(`height:118px; background:${c.cover}; position:relative; display:flex; align-items:flex-end; padding:14px;`)}>
                <div style={s("display:flex; gap:6px;")}>
                  {c.stack.map((sw, i) => (
                    <span key={i} style={s(`width:38px; height:38px; border-radius:9px; background:${sw}; border:2px solid rgba(255,255,255,0.85);`)} />
                  ))}
                </div>
                <span style={s("position:absolute; top:13px; right:13px; background:rgba(255,255,255,0.9); border-radius:8px; padding:4px 9px; font-size:12px; font-weight:700; color:#3f3d3a;")}>{c.count}</span>
              </div>
              <div style={s("padding:15px 16px 17px;")}>
                <div style={s("font-size:16px; font-weight:700; letter-spacing:-0.2px;")}>{c.name}</div>
                <div style={s("font-size:13px; color:#9a9893; margin-top:4px;")}>{c.desc}</div>
                <div style={s("display:flex; align-items:center; gap:8px; margin-top:13px;")}>
                  <span style={s("width:24px; height:24px; border-radius:50%; background:linear-gradient(135deg,#cfc9f5,#a99cf0); flex:none;")} />
                  <span style={s("font-size:12.5px; color:#a7a5a1;")}>Updated {c.updated}</span>
                </div>
              </div>
            </Link>
          ))}

          <button
            type="button"
            onClick={handleNewCollection}
            style={s("border:1.5px dashed #dcdbd8; border-radius:18px; background:#fcfcfb; min-height:240px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; cursor:pointer;")}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9a9893" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            <div style={s("font-size:14.5px; font-weight:600;")}>New collection</div>
            <div style={s("font-size:12.5px; color:#a7a5a1; text-align:center; max-width:180px;")}>Gather petals around a project or idea</div>
          </button>
        </div>
      </div>
    </>
  );
}
