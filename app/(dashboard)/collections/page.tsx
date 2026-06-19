import { ExportCollections } from "@/components/export-ui/pages/Collections";
import { getCollections } from "@/lib/data";

export default async function CollectionsPage() {
  const collections = await getCollections();
  return <ExportCollections collections={collections} />;
}
