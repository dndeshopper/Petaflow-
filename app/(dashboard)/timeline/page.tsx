import { Suspense } from "react";
import { ExportTimeline } from "@/components/export-ui/pages/Timeline";

export default function TimelinePage() {
  return (
    <Suspense fallback={null}>
      <ExportTimeline />
    </Suspense>
  );
}
