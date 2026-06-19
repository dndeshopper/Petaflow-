import { Suspense } from "react";
import { ExportSearch } from "@/components/export-ui/pages/Search";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <ExportSearch />
    </Suspense>
  );
}
