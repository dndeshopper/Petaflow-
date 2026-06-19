import {
  getCurrentUser,
  getPetals,
  getTodayStats,
} from "@/lib/data";
import { PetalsProvider } from "@/components/petals/petals-provider";
import { DashboardWithPetals } from "@/components/petals/dashboard-with-petals";
import { SearchProvider } from "@/components/search/search-provider";
import { InboxProvider } from "@/components/inbox/inbox-provider";
import { getInboxCount } from "@/lib/inbox/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, stats, petals, inboxCount] = await Promise.all([
    getCurrentUser(),
    getTodayStats(),
    getPetals(),
    getInboxCount(),
  ]);

  return (
    <InboxProvider initialCount={inboxCount}>
      <SearchProvider>
        <PetalsProvider initialPetals={petals} userId={user.id}>
          <DashboardWithPetals user={user} stats={stats}>
            {children}
          </DashboardWithPetals>
        </PetalsProvider>
      </SearchProvider>
    </InboxProvider>
  );
}
