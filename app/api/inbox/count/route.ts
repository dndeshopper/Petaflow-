import { NextResponse } from "next/server";
import { getInboxCount } from "@/lib/inbox/server";

export async function GET() {
  try {
    const count = await getInboxCount();
    return NextResponse.json({ count });
  } catch (err) {
    console.error("[GET /api/inbox/count]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load inbox count" },
      { status: 500 }
    );
  }
}
