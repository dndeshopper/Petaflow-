"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { GlobalSearchDialog } from "@/components/search/search-interface";

interface SearchContextValue {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <SearchContext.Provider value={{ open, openSearch, closeSearch }}>
      {children}
      <GlobalSearchDialog open={open} onOpenChange={setOpen} />
    </SearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useGlobalSearch must be used within SearchProvider");
  }
  return ctx;
}
