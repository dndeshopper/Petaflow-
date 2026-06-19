"use client";

import { useState } from "react";
import { s } from "@/lib/export-style";
import { usePetals } from "@/components/petals/petals-provider";

interface PetalDeleteButtonProps {
  petalId: string;
  title?: string;
}

export function PetalDeleteButton({ petalId, title }: PetalDeleteButtonProps) {
  const { deletePetal } = usePetals();
  const [busy, setBusy] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const label = title ? `"${title.slice(0, 60)}${title.length > 60 ? "…" : ""}"` : "questo petalo";
    if (!window.confirm(`Eliminare ${label}?`)) return;

    setBusy(true);
    try {
      await deletePetal(petalId);
    } catch {
      window.alert("Impossibile eliminare il petalo. Riprova.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      aria-label="Elimina petalo"
      title="Elimina"
      disabled={busy}
      onClick={handleDelete}
      style={s(
        "width:34px; height:34px; border:1px solid #eeedeb; background:#fff; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex:none; opacity:0.72; transition:opacity 0.15s;"
      )}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "0.72";
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a7a5a1" strokeWidth="1.9" strokeLinecap="round">
        <rect x="4" y="7" width="16" height="13" rx="2" />
        <path d="M9 7V5h6v2M9 11v5M15 11v5" />
      </svg>
    </button>
  );
}
