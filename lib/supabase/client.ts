import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function isRealSupabaseValue(value: string | undefined): boolean {
  if (!value) return false;
  const lower = value.toLowerCase();
  return (
    !lower.includes("your-project") &&
    !lower.includes("your-anon-key") &&
    !lower.includes("placeholder")
  );
}

export function isSupabaseConfigured(): boolean {
  return (
    isRealSupabaseValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    isRealSupabaseValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
