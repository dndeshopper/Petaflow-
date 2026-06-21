"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { s } from "@/lib/export-style";
import PetalFlowLogo from "@/components/PetalFlowLogo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useInbox } from "@/components/inbox/inbox-provider";
import type { UserProfile } from "@/lib/types";

const NAV = [
  {
    href: "/dashboard",
    label: "Today",
    exact: true,
    icon: (c: string) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7">
        <path d="M12 4c2.5 1.5 2.5 5 0 6.5C9.5 9 9.5 5.5 12 4Z" />
        <path d="M5.5 9c2.8.4 4 3.5 2.5 5.8C5.2 14.4 4 11.3 5.5 9Z" />
        <path d="M18.5 9c-2.8.4-4 3.5-2.5 5.8C18.8 14.4 20 11.3 18.5 9Z" />
        <path d="M12 13v7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/timeline",
    label: "Timeline",
    icon: (c: string) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round">
        <path d="M4 7h10M4 17h10" />
        <path d="M4 12h16" />
        <circle cx="17" cy="7" r="2" fill="#fff" />
        <circle cx="9" cy="17" r="2" fill="#fff" />
      </svg>
    ),
  },
  {
    href: "/garden",
    label: "Garden",
    icon: (c: string) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinejoin="round">
        <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
        <path d="m3 12 9 4.5L21 12" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "Search",
    icon: (c: string) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4-4" />
      </svg>
    ),
  },
  {
    href: "/collections",
    label: "Collections",
    icon: (c: string) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="12" rx="2" />
        <path d="M4 9h16M9 4v5" />
      </svg>
    ),
  },
  {
    href: "/inbox",
    label: "Inbox",
    badge: true,
    icon: (c: string) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinejoin="round">
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    ),
  },
];

interface ExportSidebarProps {
  user: UserProfile;
}

export function ExportSidebar({ user }: ExportSidebarProps) {
  const pathname = usePathname();
  const { count: inboxCount } = useInbox();
  const [showExtension, setShowExtension] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = user.full_name?.trim() || user.email.split("@")[0] || "Account";

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside style={s("width:264px; flex:none; border-right:1px solid #ececea; padding:30px 22px 24px; display:flex; flex-direction:column;")}>
      <div style={s("padding:0 8px; margin-bottom:38px;")}>
        <PetalFlowLogo size={48} />
      </div>

      <nav style={s("display:flex; flex-direction:column; gap:3px;")}>
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          const color = active ? "#1c1b1a" : "#6f6d69";
          return (
            <Link
              key={item.href}
              href={item.href}
              style={s(
                `display:flex; align-items:center; gap:13px; padding:11px 14px; border-radius:11px; text-decoration:none; font-size:14.5px; ${
                  active
                    ? "background:#f3f2f0; color:#1c1b1a; font-weight:600;"
                    : "color:#6f6d69; font-weight:500;"
                }`
              )}
            >
              {item.icon(color)}
              {item.label}
              {item.badge && inboxCount > 0 && (
                <span style={s("margin-left:auto; font-size:11.5px; font-weight:700; color:#fff; background:#6c5ce7; border-radius:20px; padding:2px 8px;")}>
                  {inboxCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={s("flex:1;")} />

      <div style={s("position:relative; padding:8px 8px 18px;")}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          style={s("display:flex; align-items:center; gap:11px; width:100%; border:none; background:none; cursor:pointer; padding:0; text-align:left;")}
        >
          <div style={s("width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#cfc9f5,#a99cf0); flex:none; overflow:hidden; display:flex; align-items:flex-end; justify-content:center;")}>
            <svg width="38" height="38" viewBox="0 0 38 38">
              <circle cx="19" cy="15" r="6.5" fill="#6c5ce7" />
              <path d="M7 38c0-7 5.4-11 12-11s12 4 12 11Z" fill="#6c5ce7" />
            </svg>
          </div>
          <div style={s("line-height:1.15; flex:1; min-width:0;")}>
            <div style={s("font-size:14px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;")}>
              {displayName}
            </div>
            <div style={s("font-size:12px; color:#6c5ce7; font-weight:500;")}>
              {user.is_pro ? "Pro Plan" : "Free Plan"}
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b3b1ad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {menuOpen && (
          <div style={s("position:absolute; left:8px; right:8px; bottom:calc(100% - 4px); background:#fff; border:1px solid #ececea; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.08); overflow:hidden; z-index:20;")}>
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              style={s("display:block; padding:12px 14px; font-size:13.5px; font-weight:600; color:#1c1b1a; text-decoration:none; border-bottom:1px solid #f0efed;")}
            >
              Impostazioni
            </Link>
            <SignOutButton
              label="Esci"
              style={{
                display: "block",
                width: "100%",
                padding: "12px 14px",
                fontSize: "13.5px",
                fontWeight: 600,
                color: "#c0392b",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            />
          </div>
        )}
      </div>

      {showExtension && (
        <div style={s("border:1px solid #ececea; border-radius:16px; padding:17px 17px 18px; position:relative;")}>
          <button
            type="button"
            onClick={() => setShowExtension(false)}
            style={s("position:absolute; top:13px; right:13px; background:none; border:none; cursor:pointer; padding:0; line-height:0;")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b3b1ad" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <div style={s("font-size:14px; font-weight:600; margin-bottom:7px;")}>Chrome Extension</div>
          <div style={s("font-size:12.5px; color:#9a9893; line-height:1.45; margin-bottom:15px;")}>
            Install the extension to save petals anywhere.
          </div>
          <button
            type="button"
            onClick={() => window.open("/settings", "_self")}
            style={s(
              "display:flex; align-items:center; gap:9px; width:100%; border:1px solid #e6e5e2; background:#fbfbfa; border-radius:11px; padding:9px 12px; cursor:pointer; font-size:13.5px; font-weight:600; color:#1c1b1a;"
            )}
          >
            <img src="/chrome-webstore.png" alt="" style={s("width:22px; height:auto; display:block; flex:none;")} />
            Add to Chrome
          </button>
        </div>
      )}
    </aside>
  );
}
