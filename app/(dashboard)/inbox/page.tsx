import { ExportInbox } from "@/components/export-ui/pages/Inbox";
import { getInboxPetals } from "@/lib/data";

export default async function InboxPage() {
  const petals = await getInboxPetals();
  return <ExportInbox initialPetals={petals} />;
}
