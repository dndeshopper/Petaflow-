"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PetalCard } from "@/components/petals/petal-card";
import type { Platform } from "@/lib/types";
import { PLATFORMS } from "@/lib/platforms";
import type { DatePreset } from "@/lib/search/types";
import { usePetalSearch } from "@/hooks/use-petal-search";
import { design } from "@/lib/design-tokens";

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "year", label: "This year" },
];

interface SearchFiltersPanelProps {
  show: boolean;
  filters: ReturnType<typeof usePetalSearch>["filters"];
  setFilters: ReturnType<typeof usePetalSearch>["setFilters"];
  onClear: () => void;
}

export function SearchFiltersPanel({
  show,
  filters,
  setFilters,
  onClear,
}: SearchFiltersPanelProps) {
  if (!show) return null;

  const activeCount = [
    filters.platform,
    filters.viewed !== undefined,
    filters.datePreset && filters.datePreset !== "all",
  ].filter(Boolean).length;

  return (
    <div
      className="mb-6 space-y-4 rounded-xl border bg-white p-5"
      style={{
        borderColor: design.colors.borderCard,
        boxShadow: design.card.shadow,
      }}
    >
      <div>
        <p className="mb-2 text-[11px] font-medium" style={{ color: design.colors.textMuted }}>
          Platform
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PLATFORMS) as Platform[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  platform: f.platform === p ? undefined : p,
                }))
              }
              className="rounded-full border px-3 py-1 text-[11px] transition-colors"
              style={{
                borderColor:
                  filters.platform === p ? design.colors.accent : design.colors.border,
                background:
                  filters.platform === p ? "rgba(108,92,231,0.08)" : "transparent",
                color:
                  filters.platform === p ? design.colors.accent : design.colors.textMuted,
              }}
            >
              {PLATFORMS[p].name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium" style={{ color: design.colors.textMuted }}>
          Date
        </p>
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  datePreset:
                    (f.datePreset ?? "all") === preset.id ? "all" : preset.id,
                }))
              }
              className="rounded-full border px-3 py-1 text-[11px] transition-colors"
              style={{
                borderColor:
                  (filters.datePreset ?? "all") === preset.id
                    ? design.colors.accent
                    : design.colors.border,
                background:
                  (filters.datePreset ?? "all") === preset.id
                    ? "rgba(108,92,231,0.08)"
                    : "transparent",
                color:
                  (filters.datePreset ?? "all") === preset.id
                    ? design.colors.accent
                    : design.colors.textMuted,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium" style={{ color: design.colors.textMuted }}>
          Status
        </p>
        <div className="flex gap-2">
          {[
            { label: "Unviewed", value: false as const },
            { label: "Viewed", value: true as const },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  viewed: f.viewed === opt.value ? undefined : opt.value,
                }))
              }
              className="rounded-full border px-3 py-1 text-[11px] transition-colors"
              style={{
                borderColor:
                  filters.viewed === opt.value ? design.colors.accent : design.colors.border,
                background:
                  filters.viewed === opt.value ? "rgba(108,92,231,0.08)" : "transparent",
                color:
                  filters.viewed === opt.value ? design.colors.accent : design.colors.textMuted,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-[11px]">
          <X className="mr-1 h-3 w-3" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

interface SearchResultsProps {
  results: ReturnType<typeof usePetalSearch>["results"];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  compact?: boolean;
}

export function SearchResults({
  results,
  total,
  loading,
  loadingMore,
  hasMore,
  error,
  onLoadMore,
  compact = false,
}: SearchResultsProps) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[12px]" style={{ color: design.colors.textMuted }}>
          {loading && results.length === 0
            ? "Searching..."
            : `${total.toLocaleString()} result${total !== 1 ? "s" : ""}`}
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className={compact ? "space-y-3" : "space-y-4"}>
        {results.map((petal) => (
          <div key={petal.id} className="flex justify-center">
            <PetalCard petal={petal} maxWidth={compact ? 300 : 340} />
          </div>
        ))}

        {!loading && results.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-[13px]" style={{ color: design.colors.textMuted }}>
              No petals found
            </p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-[12px]"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
}

interface SearchInputRowProps {
  query: string;
  onQueryChange: (value: string) => void;
  onToggleFilters: () => void;
  activeFilterCount: number;
  autoFocus?: boolean;
  placeholder?: string;
}

export function SearchInputRow({
  query,
  onQueryChange,
  onToggleFilters,
  activeFilterCount,
  autoFocus,
  placeholder = "Search title, URL, notes, platform...",
}: SearchInputRowProps) {
  return (
    <div className="mb-4 flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="h-10 pl-10 text-[13px]"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoFocus={autoFocus}
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        className="relative h-10 w-10 shrink-0"
        onClick={onToggleFilters}
        type="button"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {activeFilterCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white"
            style={{ background: design.colors.accent }}
          >
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  );
}

interface SearchInterfaceProps {
  initialQuery?: string;
}

export function SearchInterface({ initialQuery = "" }: SearchInterfaceProps) {
  const [showFilters, setShowFilters] = useState(false);
  const search = usePetalSearch({ initialQuery });

  const activeFilterCount = [
    search.filters.platform,
    search.filters.viewed !== undefined,
    search.filters.datePreset && search.filters.datePreset !== "all",
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: design.colors.text, fontFamily: design.font }}
        >
          Search
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: design.colors.textMuted }}>
          Search across title, URL, notes, and platform
        </p>
      </div>

      <SearchInputRow
        query={search.query}
        onQueryChange={search.setQuery}
        onToggleFilters={() => setShowFilters((v) => !v)}
        activeFilterCount={activeFilterCount}
      />

      <SearchFiltersPanel
        show={showFilters}
        filters={search.filters}
        setFilters={search.setFilters}
        onClear={search.clearFilters}
      />

      <SearchResults
        results={search.results}
        total={search.total}
        loading={search.loading}
        loadingMore={search.loadingMore}
        hasMore={search.hasMore}
        error={search.error}
        onLoadMore={search.loadMore}
      />
    </div>
  );
}

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const search = usePetalSearch({});

  useEffect(() => {
    if (!open) {
      setShowFilters(false);
    }
  }, [open]);

  const activeFilterCount = [
    search.filters.platform,
    search.filters.viewed !== undefined,
    search.filters.datePreset && search.filters.datePreset !== "all",
  ].filter(Boolean).length;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] transition-opacity ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Search petals"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close search"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="relative z-10 max-h-[75vh] w-full max-w-2xl overflow-hidden rounded-2xl border bg-white shadow-xl"
        style={{ borderColor: design.colors.borderCard }}
      >
        <div className="border-b p-4" style={{ borderColor: design.colors.border }}>
          <SearchInputRow
            query={search.query}
            onQueryChange={search.setQuery}
            onToggleFilters={() => setShowFilters((v) => !v)}
            activeFilterCount={activeFilterCount}
            autoFocus={open}
          />
          <SearchFiltersPanel
            show={showFilters}
            filters={search.filters}
            setFilters={search.setFilters}
            onClear={search.clearFilters}
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-4">
          <SearchResults
            results={search.results}
            total={search.total}
            loading={search.loading}
            loadingMore={search.loadingMore}
            hasMore={search.hasMore}
            error={search.error}
            onLoadMore={search.loadMore}
            compact
          />
        </div>
        <div
          className="flex items-center justify-between border-t px-4 py-2 text-[11px]"
          style={{ borderColor: design.colors.border, color: design.colors.textLight }}
        >
          <span>⌘K to toggle</span>
          <button
            type="button"
            className="font-medium hover:underline"
            style={{ color: design.colors.accent }}
            onClick={() => {
              const params = new URLSearchParams();
              if (search.query) params.set("q", search.query);
              onOpenChange(false);
              router.push(`/search?${params.toString()}`);
            }}
          >
            Open full search
          </button>
        </div>
      </div>
    </div>
  );
}
