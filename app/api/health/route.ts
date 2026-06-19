import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: isSupabaseConfigured() ? "supabase" : "demo",
    timestamp: new Date().toISOString(),
  });
}
