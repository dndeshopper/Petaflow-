import { ExportGarden } from "@/components/export-ui/pages/Garden";
import { getGardenTopics } from "@/lib/data";

export default async function GardenPage() {
  const topics = await getGardenTopics();
  return <ExportGarden topics={topics} />;
}
