import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PetalCard } from "@/components/petals/petal-card";
import { getCollectionWithPetals } from "@/lib/data";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCollectionWithPetals(id);
  if (!result) notFound();

  const { collection, petals } = result;

  return (
    <div className="px-4 pb-10 sm:px-8">
      <Link
        href="/collections"
        className="mb-6 inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to collections
      </Link>

      <div className="mb-8 border-b border-border pb-6">
        <div className="mb-2 flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: collection.color }}
          />
          <h1 className="font-serif text-2xl font-normal text-foreground">
            {collection.name}
          </h1>
        </div>
        {collection.description ? (
          <p className="text-[13px] text-muted-foreground">
            {collection.description}
          </p>
        ) : null}
        <p className="mt-2 text-[11px] text-muted-foreground">
          {petals.length} petal{petals.length !== 1 ? "s" : ""}
        </p>
      </div>

      {petals.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          No petals in this collection yet. Move items from your inbox to add
          them here.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {petals.map((petal) => (
            <PetalCard key={petal.id} petal={petal} />
          ))}
        </div>
      )}
    </div>
  );
}
