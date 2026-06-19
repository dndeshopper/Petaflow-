import type { User } from "@supabase/supabase-js";
import { DEMO_USER } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function getDefaultUserId(): string | null {
  return process.env.PETALFLOW_DEFAULT_USER_ID ?? null;
}

export function isInternalApiRequest(apiKey: string | null): boolean {
  const expected = process.env.INTERNAL_API_KEY;
  return !!(expected && apiKey && apiKey === expected);
}

/** Resolves the active user id for petal reads/writes on the server. */
export function resolvePetalUserId(
  sessionUser: User | null,
  explicitUserId?: string | null
): string | null {
  if (sessionUser?.id) return sessionUser.id;
  if (explicitUserId) return explicitUserId;
  return getDefaultUserId();
}

export function shouldUseServiceRole(
  sessionUser: User | null,
  apiKey: string | null,
  explicitUserId?: string | null
): boolean {
  if (!isSupabaseConfigured()) return false;
  if (sessionUser) return false;
  if (isInternalApiRequest(apiKey) && explicitUserId) return true;
  return !!getDefaultUserId();
}

export function getFallbackUserProfile(userId: string) {
  if (userId === DEMO_USER.id) return DEMO_USER;
  return {
    ...DEMO_USER,
    id: userId,
  };
}
