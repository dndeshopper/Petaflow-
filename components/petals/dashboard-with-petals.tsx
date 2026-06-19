"use client";

import { ExportLayout } from "@/components/export-ui/Layout";
import type { TodayStats, UserProfile } from "@/lib/types";

interface DashboardWithPetalsProps {
  user: UserProfile;
  stats: TodayStats;
  children: React.ReactNode;
}

export function DashboardWithPetals({
  user,
  children,
}: DashboardWithPetalsProps) {
  return <ExportLayout user={user}>{children}</ExportLayout>;
}
