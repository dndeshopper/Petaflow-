"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { design } from "@/lib/design-tokens";
import {
  NavIconCollections,
  NavIconGarden,
  NavIconInbox,
  NavIconSearch,
  NavIconTimeline,
  NavIconToday,
} from "@/components/ui/design-icons";
import type { UserProfile } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "Today", Icon: NavIconToday },
  { href: "/timeline", label: "Timeline", Icon: NavIconTimeline },
  { href: "/garden", label: "Garden", Icon: NavIconGarden },
  { href: "/search", label: "Search", Icon: NavIconSearch },
  { href: "/collections", label: "Collections", Icon: NavIconCollections },
  { href: "/inbox", label: "Inbox", Icon: NavIconInbox },
];

interface SidebarProps {
  user: UserProfile;
  inboxCount?: number;
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ user, inboxCount = 0, mobileOpen = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [showExtension, setShowExtension] = useState(true);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r bg-white transition-transform duration-200 ease-out",
        "w-[min(264px,85vw)] lg:static lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      style={{
        borderColor: design.colors.border,
        padding: "24px 18px 20px",
        fontFamily: design.font,
      }}
    >
      <div className="mb-8 px-1 lg:mb-[38px] lg:px-2">
        <Link href="/dashboard" onClick={onNavigate}>
          <Image
            src={design.logo}
            alt="PetalFlow"
            width={150}
            height={40}
            className="h-auto w-[130px] lg:w-[150px]"
            priority
          />
        </Link>
      </div>

      <nav className="flex flex-col gap-[3px]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.Icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-[13px] rounded-[11px] px-[14px] py-[11px] no-underline transition-colors"
              style={{
                background: isActive ? design.colors.bgNavActive : "transparent",
                color: isActive ? design.colors.text : design.colors.textNav,
                fontSize: "14.5px",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <Icon active={isActive} />
              <span className="flex-1">{item.label}</span>
              {item.href === "/inbox" && inboxCount > 0 && (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                  style={{ background: design.colors.accent }}
                >
                  {inboxCount > 99 ? "99+" : inboxCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-[11px] px-1 pb-4 pt-2 lg:px-2 lg:pb-[18px]">
        <div
          className="flex h-[38px] w-[38px] shrink-0 items-end justify-center overflow-hidden rounded-full"
          style={{ background: "linear-gradient(135deg,#cfc9f5,#a99cf0)" }}
        >
          <svg width="38" height="38" viewBox="0 0 38 38">
            <circle cx="19" cy="15" r="6.5" fill="#6c5ce7" />
            <path d="M7 38c0-7 5.4-11 12-11s12 4 12 11Z" fill="#6c5ce7" />
          </svg>
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-sm font-semibold" style={{ color: design.colors.text }}>
            {user.full_name}
          </div>
          {user.is_pro && (
            <div className="text-xs font-medium" style={{ color: design.colors.accent }}>
              Pro Plan
            </div>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b3b1ad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {showExtension && (
        <div
          className="relative rounded-2xl border p-[17px]"
          style={{ borderColor: design.colors.border }}
        >
          <button
            onClick={() => setShowExtension(false)}
            className="absolute right-[13px] top-[13px] border-none bg-transparent p-0 leading-none"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b3b1ad" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <div className="mb-[7px] text-sm font-semibold">Chrome Extension</div>
          <div className="mb-[15px] text-[12.5px] leading-snug" style={{ color: design.colors.textMuted }}>
            Install the extension to save petals anywhere.
          </div>
          <a
            href="/chrome-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-[9px] rounded-[11px] border px-3 py-[9px] text-[13.5px] font-semibold no-underline"
            style={{
              borderColor: "#e6e5e2",
              background: design.colors.bgButton,
              color: design.colors.text,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#fff" stroke="#e0dfdc" />
              <circle cx="12" cy="12" r="3.6" fill="#4a8cf0" />
              <path d="M12 2v6" stroke="#ea4335" strokeWidth="3" />
              <path d="M21 7 13 9" stroke="#fbbc05" strokeWidth="3" />
              <path d="M4 18l6-5" stroke="#34a853" strokeWidth="3" />
            </svg>
            Add to Chrome
          </a>
        </div>
      )}
    </aside>
  );
}
