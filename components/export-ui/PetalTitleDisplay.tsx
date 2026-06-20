import type { Platform } from "@/lib/types";
import { s } from "@/lib/export-style";

interface PetalTitleDisplayProps {
  title: string;
  platformId?: Platform;
  fontSize?: number;
}

export function PetalTitleDisplay({
  title,
  platformId,
  fontSize = 15,
}: PetalTitleDisplayProps) {
  if (platformId === "x") {
    return (
      <div
        style={{
          fontSize,
          fontWeight: 600,
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {title}
      </div>
    );
  }

  return (
    <div
      style={s(
        `font-size:${fontSize}px; font-weight:600; line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`,
      )}
    >
      {title}
    </div>
  );
}
