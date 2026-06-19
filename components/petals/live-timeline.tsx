"use client";

import { useState } from "react";
import { Timeline } from "@/components/timeline/timeline";
import { AddPetalDialog } from "@/components/petals/add-petal-dialog";
import { usePetals } from "@/components/petals/petals-provider";

export function LiveTimeline() {
  const { petals, error } = usePetals();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      {error && (
        <div
          className="mx-4 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
      <Timeline petals={petals} onAddClick={() => setAddOpen(true)} />
      <AddPetalDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
