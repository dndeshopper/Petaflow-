import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  DEMO_USER,
  getDemoPetals,
  addDemoPetal,
  getDemoTodayStats,
  DEMO_COLLECTIONS,
  DEMO_GARDEN_TOPICS,
} from "@/lib/demo-data";
import {
  getDefaultUserId,
  getFallbackUserProfile,
  resolvePetalUserId,
  shouldUseServiceRole,
} from "@/lib/petals/resolve-user";
import type {
  CreatePetalInput,
  Petal,
  SearchFilters,
  TodayStats,
  Collection,
  GardenTopic,
  UserProfile,
} from "@/lib/types";
import { detectPlatform, resolvePetalPlatform } from "@/lib/platforms";
import { getYoutubeThumbnailUrl } from "@/lib/preview/youtube";

export interface DataContext {
  userId?: string;
  apiKey?: string | null;
}

export async function getSupabaseClients(ctx?: DataContext) {
  const { createClient, createServiceClient } = await import(
    "@/lib/supabase/server"
  );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = resolvePetalUserId(user, ctx?.userId);
  const useService = shouldUseServiceRole(user, ctx?.apiKey ?? null, ctx?.userId);

  if (useService && userId) {
    return { supabase: await createServiceClient(), userId, sessionUser: user };
  }

  return { supabase, userId, sessionUser: user };
}

export async function getCurrentUser(ctx?: DataContext): Promise<UserProfile> {
  if (!isSupabaseConfigured()) return DEMO_USER;

  const { supabase, userId, sessionUser } = await getSupabaseClients(ctx);
  const activeId = sessionUser?.id ?? userId ?? getDefaultUserId();

  if (!activeId) return DEMO_USER;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", activeId)
    .single();

  if (data) return data;

  if (sessionUser) {
    return {
      ...DEMO_USER,
      id: sessionUser.id,
      email: sessionUser.email ?? "",
    };
  }

  return getFallbackUserProfile(activeId);
}

export async function getPetals(ctx?: DataContext): Promise<Petal[]> {
  if (!isSupabaseConfigured()) return getDemoPetals();

  const { supabase, userId } = await getSupabaseClients(ctx);
  if (!userId) return getDemoPetals();

  const { data, error } = await supabase
    .from("petals")
    .select(
      "id, user_id, url, title, platform, note, created_at, viewed, status, preview_url, theme, preview_status, description"
    )
    .eq("user_id", userId)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const petals = (data ?? []).map((petal) => {
    const platform = resolvePetalPlatform(petal);
    return platform === petal.platform ? petal : { ...petal, platform };
  });

  const fixes = petals.filter(
    (petal, index) => petal.platform !== (data?.[index]?.platform ?? petal.platform)
  );

  if (fixes.length > 0) {
    void Promise.all(
      fixes.map((petal) =>
        supabase
          .from("petals")
          .update({ platform: petal.platform })
          .eq("id", petal.id)
      )
    ).catch((err) => {
      console.warn("[getPetals] Platform backfill failed:", err);
    });
  }

  return petals;
}

export async function createPetal(
  input: CreatePetalInput,
  ctx?: DataContext
): Promise<Petal> {
  const platform = input.platform ?? detectPlatform(input.url);
  const youtubeThumb =
    platform === "youtube" ? getYoutubeThumbnailUrl(input.url) : null;
  let title = input.title;
  if (!title) {
    try {
      title = new URL(input.url).hostname;
    } catch {
      title = input.url;
    }
  }

  if (!isSupabaseConfigured()) {
    return addDemoPetal({
      user_id: ctx?.userId ?? DEMO_USER.id,
      url: input.url,
      title,
      note: input.note ?? null,
      platform,
      preview_url: youtubeThumb,
      viewed: false,
      status: "inbox",
      theme: input.theme ?? null,
      preview_status: youtubeThumb ? "completed" : "pending",
    });
  }

  const { supabase, userId } = await getSupabaseClients(ctx);
  if (!userId) {
    throw new Error("No user configured. Sign in or set PETALFLOW_DEFAULT_USER_ID.");
  }

  const { data, error } = await supabase
    .from("petals")
    .insert({
      user_id: userId,
      url: input.url,
      title,
      note: input.note ?? null,
      platform,
      theme: input.theme ?? null,
      preview_url: youtubeThumb,
      preview_status: youtubeThumb ? "completed" : "pending",
      viewed: false,
      status: "inbox",
    })
    .select(
      "id, user_id, url, title, platform, note, created_at, viewed, status, preview_url, theme, preview_status, description"
    )
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function searchPetals(
  filters: SearchFilters,
  ctx?: DataContext
): Promise<Petal[]> {
  const { searchPetals: runSearch } = await import("@/lib/search/server");
  const response = await runSearch(
    {
      query: filters.query,
      platform: filters.platform,
      viewed: filters.viewed,
      date_from: filters.date_from,
      date_to: filters.date_to,
      limit: filters.limit ?? 100,
      offset: filters.offset ?? 0,
    },
    ctx
  );
  return response.petals;
}

export async function getTodayStats(): Promise<TodayStats> {
  if (!isSupabaseConfigured()) return getDemoTodayStats();

  const petals = await getPetals();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPetals = petals.filter((p) => new Date(p.created_at) >= today);

  const themeCounts: Record<string, number> = {};
  petals.forEach((p) => {
    if (p.theme) themeCounts[p.theme] = (themeCounts[p.theme] ?? 0) + 1;
  });

  const collections = await getCollections();

  return {
    petals_saved: todayPetals.length,
    minutes_to_watch: todayPetals.length * 8,
    top_themes: Object.entries(themeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4),
    recent_collections: collections.slice(0, 3),
  };
}

export async function getInboxPetals(ctx?: DataContext): Promise<Petal[]> {
  const { getInboxPetals: loadInbox } = await import("@/lib/inbox/server");
  return loadInbox(ctx);
}

export async function getCollections(ctx?: DataContext): Promise<Collection[]> {
  if (!isSupabaseConfigured()) return DEMO_COLLECTIONS;

  const { supabase, userId } = await getSupabaseClients(ctx);
  if (!userId) return DEMO_COLLECTIONS;

  const { data } = await supabase
    .from("collections")
    .select("*, collection_petals(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((c) => ({
    ...c,
    petal_count: c.collection_petals?.[0]?.count ?? 0,
  }));
}

export async function getGardenTopics(ctx?: DataContext): Promise<GardenTopic[]> {
  if (!isSupabaseConfigured()) return DEMO_GARDEN_TOPICS;

  const { supabase, userId } = await getSupabaseClients(ctx);
  if (!userId) return DEMO_GARDEN_TOPICS;

  const { data } = await supabase
    .from("garden_topics")
    .select("*")
    .eq("user_id", userId)
    .order("petal_count", { ascending: false });

  return data ?? [];
}

export async function getCollectionWithPetals(
  collectionId: string,
  ctx?: DataContext
): Promise<{ collection: Collection; petals: Petal[] } | null> {
  if (!isSupabaseConfigured()) {
    const collection = DEMO_COLLECTIONS.find((c) => c.id === collectionId);
    if (!collection) return null;
    return { collection, petals: [] };
  }

  const { supabase, userId } = await getSupabaseClients(ctx);
  if (!userId) {
    const collection = DEMO_COLLECTIONS.find((c) => c.id === collectionId);
    if (!collection) return null;
    return { collection, petals: [] };
  }

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .eq("user_id", userId)
    .single();

  if (collectionError || !collection) return null;

  const { data: links, error: linksError } = await supabase
    .from("collection_petals")
    .select("petal_id")
    .eq("collection_id", collectionId);

  if (linksError) throw new Error(linksError.message);

  const petalIds = (links ?? []).map((l) => l.petal_id);
  if (petalIds.length === 0) {
    return { collection: { ...collection, petal_count: 0 }, petals: [] };
  }

  const { data: petals, error: petalsError } = await supabase
    .from("petals")
    .select(
      "id, user_id, url, title, platform, note, created_at, viewed, status, preview_url, theme, preview_status, description"
    )
    .in("id", petalIds)
    .order("created_at", { ascending: false });

  if (petalsError) throw new Error(petalsError.message);

  return {
    collection: {
      ...collection,
      petal_count: petals?.length ?? 0,
    },
    petals: petals ?? [],
  };
}

export async function getNewPetalsTodayCount(): Promise<number> {
  const stats = await getTodayStats();
  return stats.petals_saved;
}
