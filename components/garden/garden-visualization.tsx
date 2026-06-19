"use client";

import type { GardenTopic } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GardenVisualizationProps {
  topics: GardenTopic[];
}

function Plant({ topic, index }: { topic: GardenTopic; index: number }) {
  const height = 40 + topic.growth_level * 24;
  const leafCount = Math.min(topic.growth_level + 1, 6);
  const opacity = 0.3 + topic.growth_level * 0.14;

  return (
    <div
      className="group flex flex-col items-center animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Leaves */}
      <div className="relative mb-1" style={{ height: height * 0.6 }}>
        {Array.from({ length: leafCount }).map((_, i) => {
          const angle = (i / leafCount) * 360;
          const radius = 12 + topic.growth_level * 4;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius * 0.5;

          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 transition-transform group-hover:scale-110"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle + 90}deg)`,
              }}
            >
              <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                <ellipse
                  cx="8"
                  cy="12"
                  rx="6"
                  ry="10"
                  fill="#6B7B6E"
                  opacity={opacity}
                />
              </svg>
            </div>
          );
        })}
      </div>

      {/* Stem */}
      <div
        className="w-0.5 rounded-full bg-petal-sage/40"
        style={{ height }}
      />

      {/* Pot */}
      <div className="mt-1 h-3 w-8 rounded-b-md bg-petal-warm/20" />

      {/* Label */}
      <div className="mt-3 text-center">
        <p className="text-[12px] font-medium text-foreground">{topic.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {topic.petal_count} petal{topic.petal_count !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

export function GardenVisualization({ topics }: GardenVisualizationProps) {
  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-lg text-foreground">Your garden is empty</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Tag petals with themes to grow your interests.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Ground line */}
      <div className="absolute bottom-[52px] left-0 right-0 h-px bg-border" />

      <div
        className={cn(
          "flex flex-wrap items-end justify-center gap-12 px-8 pb-8 pt-12",
          topics.length <= 3 && "gap-16"
        )}
      >
        {topics.map((topic, i) => (
          <Plant key={topic.id} topic={topic} index={i} />
        ))}
      </div>
    </div>
  );
}
