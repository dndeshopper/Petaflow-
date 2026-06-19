"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Petal } from "@/lib/types";
import { buildSearchQueryString } from "@/lib/search/params";
import type { SearchResponse, SearchUiFilters } from "@/lib/search/types";
import { SEARCH_PAGE_SIZE } from "@/lib/search/types";
import { uiFiltersToSearchOptions } from "@/lib/search/params";

const DEBOUNCE_MS = 150;

interface UsePetalSearchOptions {
  initialQuery?: string;
  initialFilters?: SearchUiFilters;
}

export function usePetalSearch({
  initialQuery = "",
  initialFilters = {},
}: UsePetalSearchOptions = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchUiFilters>(initialFilters);
  const [results, setResults] = useState<Petal[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const offsetRef = useRef(0);

  const fetchSearch = useCallback(
    async (append: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const offset = append ? offsetRef.current : 0;
      const options = uiFiltersToSearchOptions(query, filters, {
        limit: SEARCH_PAGE_SIZE,
        offset,
      });

      if (append) setLoadingMore(true);
      else setLoading(true);

      setError(null);

      try {
        const qs = buildSearchQueryString(options);
        const res = await fetch(`/api/search?${qs}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Search failed");
        }

        const data = (await res.json()) as SearchResponse;

        setResults((prev) =>
          append ? [...prev, ...data.petals] : data.petals
        );
        setTotal(data.total);
        setHasMore(data.hasMore);
        offsetRef.current = append
          ? offset + data.petals.length
          : data.petals.length;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Search failed");
        if (!append) setResults([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [query, filters]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchSearch(false);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, filters, fetchSearch]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    void fetchSearch(true);
  }, [hasMore, loadingMore, loading, fetchSearch]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
    clearFilters,
  };
}
