import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { performInboxAction } from "@/lib/inbox/server";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("mark_viewed") }),
  z.object({ action: z.literal("archive") }),
  z.object({ action: z.literal("add_note"), note: z.string().min(1).max(2000) }),
  z.object({
    action: z.literal("move_to_collection"),
    collection_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("move_to_garden"),
    theme: z.string().min(1).max(120),
  }),
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const petal = await performInboxAction(id, parsed.data);
    return NextResponse.json({ petal });
  } catch (err) {
    console.error(`[PATCH /api/petals/${id}]`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 }
    );
  }
}
