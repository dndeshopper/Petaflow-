import { NextRequest, NextResponse } from "next/server";
import { parseSearchParams } from "@/lib/search/params";
import { searchPetals } from "@/lib/search/server";
import { isInternalApiRequest } from "@/lib/petals/resolve-user";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
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

    const options = parseSearchParams(request.nextUrl.searchParams);
    const result = await searchPetals(options, {
      userId: userIdParam ?? undefined,
      apiKey,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/search]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 }
    );
  }
}
