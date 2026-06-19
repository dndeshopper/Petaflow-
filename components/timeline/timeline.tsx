"use client";

import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { design } from "@/lib/design-tokens";
import { StemBottomLeaf, StemTopFlower } from "@/components/ui/design-icons";
import { PetalCard, AddPetalPlaceholder } from "@/components/petals/petal-card";
import { formatPetalTime } from "@/lib/utils";
import type { Petal } from "@/lib/types";

interface TimelineProps {
  petals: Petal[];
  onAddClick?: () => void;
}

function TimelineRowDesktop({
  petal,
  side,
}: {
  petal: Petal;
  side: "left" | "right";
}) {
  const time = formatPetalTime(petal.created_at);
  const cardWidth = side === "right" ? 340 : 330;

  return (
    <div
      className="relative z-[1] grid items-center py-[9px]"
      style={{ gridTemplateColumns: "1fr minmax(56px, 88px) 1fr" }}
    >
      <div className="justify-self-end px-1">
        {side === "left" ? <PetalCard petal={petal} maxWidth={cardWidth} /> : null}
      </div>
      <div className="text-center">
        <span
          className="inline-block bg-white px-1.5 py-[7px] text-[12.5px]"
          style={{ color: design.colors.textMuted }}
        >
          {time}
        </span>
      </div>
      <div className="justify-self-start px-1">
        {side === "right" ? <PetalCard petal={petal} maxWidth={cardWidth} /> : null}
      </div>
    </div>
  );
}

function TimelineRowMobile({ petal }: { petal: Petal }) {
  const time = formatPetalTime(petal.created_at);

  return (
    <div className="relative z-[1] py-2">
      <div className="mb-2 text-center">
        <span
          className="inline-block rounded-full bg-white px-3 py-1 text-[12px]"
          style={{ color: design.colors.textMuted }}
        >
          {time}
        </span>
      </div>
      <PetalCard petal={petal} className="mx-auto" />
    </div>
  );
}

export function Timeline({ petals, onAddClick }: TimelineProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (petals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center sm:py-24" style={{ fontFamily: design.font }}>
        <StemTopFlower />
        <h3 className="mt-4 text-lg font-semibold">Your timeline is empty</h3>
        <p className="mt-1 text-[13px]" style={{ color: design.colors.textMuted }}>
          Save your first petal — a video, article, or thread worth revisiting.
        </p>
        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: design.colors.accent }}
          >
            Add your first petal
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-w-0 flex-1 px-1 sm:px-2" style={{ fontFamily: design.font }}>
      <div className="mb-2 flex items-center justify-center gap-4 sm:gap-8">
        <button
          type="button"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border-none bg-transparent"
          onClick={() => setSelectedDate((d) => subDays(d, 1))}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8884" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-base font-bold tracking-tight sm:text-[17px]" style={{ color: design.colors.text }}>
            {format(selectedDate, "d MMMM yyyy")}
          </div>
          <div className="mt-0.5 text-xs sm:text-[13px]" style={{ color: design.colors.textLight }}>
            {format(selectedDate, "EEEE")}
          </div>
        </div>
        <button
          type="button"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border-none bg-transparent"
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8884" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10 6 6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="mx-auto w-full max-w-[900px]">
        <div className="mb-0.5 flex justify-center">
          <StemTopFlower />
        </div>

        <div className="relative">
          <div
            className="absolute bottom-0 left-1/2 top-0 z-0 hidden w-[1.5px] -translate-x-1/2 lg:block"
            style={{ background: design.colors.stem }}
          />

          {/* Mobile: single column */}
          <div className="lg:hidden">
            {petals.map((petal) => (
              <TimelineRowMobile key={petal.id} petal={petal} />
            ))}
            <div className="py-2">
              <AddPetalPlaceholder className="mx-auto" onClick={onAddClick} />
            </div>
          </div>

          {/* Desktop: alternating */}
          <div className="hidden lg:block">
            {petals.map((petal, index) => {
              const side = index % 2 === 0 ? "left" : "right";
              return (
                <TimelineRowDesktop key={petal.id} petal={petal} side={side} />
              );
            })}
            <div
              className="relative z-[1] grid items-center py-[9px]"
              style={{ gridTemplateColumns: "1fr minmax(56px, 88px) 1fr" }}
            >
              <div className="justify-self-end px-1">
                <AddPetalPlaceholder maxWidth={330} onClick={onAddClick} />
              </div>
              <div />
              <div />
            </div>
          </div>
        </div>

        <div className="mt-0.5 flex justify-center">
          <StemBottomLeaf />
        </div>
      </div>
    </div>
  );
}
