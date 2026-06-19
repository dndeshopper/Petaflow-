import { NextRequest, NextResponse } from "next/server";
import { askPetalFlow } from "@/lib/ai";
import { getPetals, getCurrentUser } from "@/lib/data";
import { z } from "zod";

const askSchema = z.object({
  question: z.string().min(1).max(500),
  provider: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = askSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }

    const [petals, user] = await Promise.all([getPetals(), getCurrentUser()]);

    const response = await askPetalFlow(
      parsed.data.question,
      { petals, userName: user.full_name },
      parsed.data.provider
    );

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ask failed" },
      { status: 500 }
    );
  }
}
