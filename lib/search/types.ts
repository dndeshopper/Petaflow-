import type { Petal, Platform, SearchFilters } from "@/lib/types";

export const SEARCH_PAGE_SIZE = 40;
export const SEARCH_MAX_LIMIT = 100;

export type SearchOptions = SearchFilters;

export interface SearchResponse {
  petals: Petal[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export type DatePreset = "all" | "today" | "week" | "month" | "year";

export interface SearchUiFilters {
  platform?: Platform;
  viewed?: boolean;
  datePreset?: DatePreset;
  date_from?: string;
  date_to?: string;
}
