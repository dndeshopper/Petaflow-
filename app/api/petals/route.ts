import { NextRequest, NextResponse } from "next/server";
import { createPetal, getPetals } from "@/lib/data";
import { enqueuePreview } from "@/lib/preview/queue";
import { detectPlatform } from "@/lib/platforms";
import { isInternalApiRequest } from "@/lib/petals/resolve-user";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { z } from "zod";

const createPetalSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  note: z.string().optional(),
  platform: z.string().optional(),
  theme: z.string().optional(),
  user_id: z.string().min(1).optional(),
  captured_at: z.string().datetime().optional(),
});

function getApiKey(request: NextRequest): string | null {
  return request.headers.get("x-api-key");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createPetalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const apiKey = getApiKey(request);
    const { url, title, note, theme, user_id } = parsed.data;

    if (
      isSupabaseConfigured() &&
      user_id &&
      !isInternalApiRequest(apiKey)
    ) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.id !== user_id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const platform = detectPlatform(url);

    const petal = await createPetal(
      {
        url,
        title: title ?? undefined,
        note,
        platform,
        theme,
      },
      { userId: user_id, apiKey }
    );

    enqueuePreview({
      petalId: petal.id,
      url,
      title: petal.title,
      note: petal.note,
      platform,
    });

    return NextResponse.json({ petal }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/petals]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create petal" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = getApiKey(request);
    const userIdParam = request.nextUrl.searchParams.get("user_id");

    if (
      isSupabaseConfigured() &&
      userIdParam &&
      !isInternalApiRequest(apiKey)
    ) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.id !== userIdParam) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const petals = await getPetals({
      userId: userIdParam ?? undefined,
      apiKey,
    });

    return NextResponse.json({ petals });
  } catch (err) {
    console.error("[GET /api/petals]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load petals" },
      { status: 500 }
    );
  }
}
