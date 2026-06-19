import type { CSSProperties, ReactNode } from "react";
import { s } from "@/lib/export-style";

interface PetalCardLinkProps {
  url: string;
  children: ReactNode;
  style?: CSSProperties;
}

/** Opens the saved petal URL in a new tab. */
export function PetalCardLink({ url, children, style }: PetalCardLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...s("display:block; text-decoration:none; color:inherit; cursor:pointer;"),
        ...style,
      }}
    >
      {children}
    </a>
  );
}

interface PetalThumbProps {
  thumbBg: string;
  thumbImageUrl: string | null;
  thumbLabel: string;
  width: number;
  height: number;
}

export function PetalThumb({
  thumbBg,
  thumbImageUrl,
  thumbLabel,
  width,
  height,
}: PetalThumbProps) {
  return (
    <div
      style={{
        ...s(
          `width:${width}px; height:${height}px; border-radius:9px; flex:none; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px; font-weight:800; letter-spacing:0.4px; overflow:hidden;`
        ),
        background: thumbImageUrl ? undefined : thumbBg,
        backgroundImage: thumbImageUrl ? `url("${thumbImageUrl}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {!thumbImageUrl ? thumbLabel : null}
    </div>
  );
}
