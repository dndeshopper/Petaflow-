"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Header } from "@/components/header/header";
import { InsightPanel } from "@/components/sidebar/insight-panel";
import { design } from "@/lib/design-tokens";
import type { TodayStats, UserProfile } from "@/lib/types";

interface DashboardShellProps {
  user: UserProfile;
  newPetalsCount: number;
  inboxCount?: number;
  stats: TodayStats;
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  newPetalsCount,
  inboxCount = 0,
  stats,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen w-full overflow-x-hidden"
      style={{
        background: design.colors.bg,
        color: design.colors.text,
        fontFamily: design.font,
      }}
    >
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        user={user}
        inboxCount={inboxCount}
        mobileOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          userName={user.full_name}
          newPetalsCount={newPetalsCount}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="flex flex-1 flex-col gap-6 px-4 pb-8 pt-0 lg:flex-row lg:gap-0 lg:px-0 lg:pb-10 lg:pl-6 xl:pl-10">
          <main className="min-w-0 flex-1">{children}</main>
          <InsightPanel stats={stats} />
        </div>
      </div>
    </div>
  );
}
