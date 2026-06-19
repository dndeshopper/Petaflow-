import { ExportDashboard } from "@/components/export-ui/pages/Dashboard";
import { getCurrentUser, getTodayStats } from "@/lib/data";

export default async function DashboardPage() {
  const [user, stats] = await Promise.all([getCurrentUser(), getTodayStats()]);
  return <ExportDashboard user={user} stats={stats} />;
}
