import { isSupabaseConfigured } from "@/lib/supabase/client";
import { searchDemoPetals } from "@/lib/demo-data";
import { getSupabaseClients, type DataContext } from "@/lib/data";
import { resolvePetalPlatform } from "@/lib/platforms";
import type { Petal } from "@/lib/types";
import type { SearchOptions, SearchResponse } from "./types";
import { SEARCH_PAGE_SIZE } from "./types";

const PETAL_COLUMNS =
  "id, user_id, url, title, platform, note, created_at, viewed, status, preview_url, theme, preview_status, description";

export async function searchPetals(
  options: SearchOptions,
  ctx?: DataContext
): Promise<SearchResponse> {
  const limit = options.limit ?? SEARCH_PAGE_SIZE;
  const offset = options.offset ?? 0;

  if (!isSupabaseConfigured()) {
    const all = searchDemoPetals(options);
    const petals = all.slice(offset, offset + limit);
    return {
      petals,
      total: all.length,
      limit,
      offset,
      hasMore: offset + petals.length < all.length,
    };
  }

  const { supabase, userId } = await getSupabaseClients(ctx);

  if (!userId) {
    const all = searchDemoPetals(options);
    const petals = all.slice(offset, offset + limit);
    return {
      petals,
      total: all.length,
      limit,
      offset,
      hasMore: offset + petals.length < all.length,
    };
  }

  let query = supabase
    .from("petals")
    .select(PETAL_COLUMNS, { count: "exact" })
    .eq("user_id", userId);

  if (options.platform) query = query.eq("platform", options.platform);
  if (options.theme) query = query.eq("theme", options.theme);
  if (options.status) query = query.eq("status", options.status);
  if (options.viewed !== undefined) query = query.eq("viewed", options.viewed);
  if (options.date_from) query = query.gte("created_at", options.date_from);
  if (options.date_to) query = query.lte("created_at", options.date_to);

  if (options.query) {
    query = query.textSearch("search_vector", options.query, {
      type: "websearch",
      config: "english",
    });
  }

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const petals = ((data ?? []) as Petal[]).map((petal) => {
    const platform = resolvePetalPlatform(petal);
    return platform === petal.platform ? petal : { ...petal, platform };
  });
  const total = count ?? petals.length;

  return {
    petals,
    total,
    limit,
    offset,
    hasMore: offset + petals.length < total,
  };
}
