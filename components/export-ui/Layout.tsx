"use client";

import type { ReactNode } from "react";
import { s } from "@/lib/export-style";
import { ExportSidebar } from "@/components/export-ui/Sidebar";
import type { UserProfile } from "@/lib/types";

interface ExportLayoutProps {
  user: UserProfile;
  children: ReactNode;
}

export function ExportLayout({ user, children }: ExportLayoutProps) {
  return (
    <div
      style={s(
        "display:flex; min-height:100vh; width:100%; min-width:1440px; background:#ffffff; color:#1c1b1a; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;"
      )}
    >
      <ExportSidebar user={user} />
      <div style={s("flex:1; display:flex; flex-direction:column; min-width:0;")}>{children}</div>
    </div>
  );
}
