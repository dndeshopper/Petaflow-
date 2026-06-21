import { s } from "@/lib/export-style";

interface PetalTitleDisplayProps {
  title: string;
  fontSize?: number;
}

/** Single-line truncated title — same layout as YouTube petal cards. */
export function PetalTitleDisplay({
  title,
  fontSize = 15,
}: PetalTitleDisplayProps) {
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
