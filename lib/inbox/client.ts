import type { InboxAction, Petal } from "@/lib/types";

export async function fetchInboxCount(): Promise<number> {
  const res = await fetch("/api/inbox/count", { cache: "no-store" });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

export async function performInboxActionRequest(
  petalId: string,
  action: InboxAction
): Promise<Petal> {
  const res = await fetch(`/api/petals/${petalId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Action failed");
  }

  const data = await res.json();
  return data.petal;
}
