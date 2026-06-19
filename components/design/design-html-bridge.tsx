"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Intercepts data-pf-link clicks inside injected design HTML */
export function DesignHtmlBridge() {
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        "a[data-pf-link], [data-pf-link-href]"
      ) as HTMLAnchorElement | HTMLElement | null;
      if (!target) return;
      const href =
        target.getAttribute("href") ??
        target.getAttribute("data-pf-link-href");
      if (!href || href === "#") return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          e.preventDefault();
          router.push(url.pathname + url.search);
        }
      } catch {
        // ignore invalid URLs
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return null;
}

interface DesignHtmlBlockProps {
  html: string;
  className?: string;
  id?: string;
}

export function DesignHtmlBlock({ html, className, id }: DesignHtmlBlockProps) {
  return (
    <div
      id={id}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
