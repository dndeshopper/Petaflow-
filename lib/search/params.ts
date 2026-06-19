import type { Platform } from "@/lib/types";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import type { DatePreset, SearchOptions, SearchUiFilters } from "./types";
import { SEARCH_MAX_LIMIT, SEARCH_PAGE_SIZE } from "./types";

export function datePresetToRange(
  preset: DatePreset
): { date_from?: string; date_to?: string } {
  const now = new Date();

  switch (preset) {
    case "today":
      return {
        date_from: startOfDay(now).toISOString(),
        date_to: endOfDay(now).toISOString(),
      };
    case "week":
      return {
        date_from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        date_to: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      };
    case "month":
      return {
        date_from: startOfMonth(now).toISOString(),
        date_to: endOfMonth(now).toISOString(),
      };
    case "year":
      return {
        date_from: startOfYear(now).toISOString(),
        date_to: endOfYear(now).toISOString(),
      };
    default:
      return {};
  }
}

export function uiFiltersToSearchOptions(
  query: string,
  ui: SearchUiFilters,
  pagination?: { limit?: number; offset?: number }
): SearchOptions {
  const trimmed = query.trim();
  const range =
    ui.datePreset && ui.datePreset !== "all"
      ? datePresetToRange(ui.datePreset)
      : { date_from: ui.date_from, date_to: ui.date_to };

  return {
    query: trimmed || undefined,
    platform: ui.platform,
    viewed: ui.viewed,
    date_from: range.date_from,
    date_to: range.date_to,
    limit: pagination?.limit ?? SEARCH_PAGE_SIZE,
    offset: pagination?.offset ?? 0,
  };
}

export function parseSearchParams(
  searchParams: URLSearchParams
): SearchOptions {
  const limit = Math.min(
    Math.max(
      parseInt(searchParams.get("limit") ?? String(SEARCH_PAGE_SIZE), 10) ||
        SEARCH_PAGE_SIZE,
      1
    ),
    SEARCH_MAX_LIMIT
  );
  const offset = Math.max(
    parseInt(searchParams.get("offset") ?? "0", 10) || 0,
    0
  );

  const viewedParam = searchParams.get("viewed");
  let viewed: boolean | undefined;
  if (viewedParam === "true") viewed = true;
  if (viewedParam === "false") viewed = false;

  const platform = searchParams.get("platform") as Platform | null;

  return {
    query: searchParams.get("q")?.trim() || undefined,
    platform: platform ?? undefined,
    viewed,
    date_from: searchParams.get("date_from") ?? undefined,
    date_to: searchParams.get("date_to") ?? undefined,
    limit,
    offset,
  };
}

export function buildSearchQueryString(options: SearchOptions): string {
  const params = new URLSearchParams();

  if (options.query) params.set("q", options.query);
  if (options.platform) params.set("platform", options.platform);
  if (options.viewed !== undefined)
    params.set("viewed", String(options.viewed));
  if (options.date_from) params.set("date_from", options.date_from);
  if (options.date_to) params.set("date_to", options.date_to);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.offset) params.set("offset", String(options.offset));

  return params.toString();
}
