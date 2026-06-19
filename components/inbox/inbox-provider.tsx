"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchInboxCount } from "@/lib/inbox/client";
import { PETALS_CHANGED_EVENT } from "@/lib/sync-events";

interface InboxContextValue {
  count: number;
  refreshCount: () => Promise<void>;
  incrementCount: () => void;
  decrementCount: () => void;
}

const InboxContext = createContext<InboxContextValue | null>(null);

export function InboxProvider({
  initialCount,
  children,
}: {
  initialCount: number;
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(initialCount);

  const refreshCount = useCallback(async () => {
    const next = await fetchInboxCount();
    setCount(next);
  }, []);

  const incrementCount = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const decrementCount = useCallback(() => {
    setCount((c) => Math.max(0, c - 1));
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshCount();
      }
    };
    const onPetalsChanged = () => {
      void refreshCount();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(PETALS_CHANGED_EVENT, onPetalsChanged);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(PETALS_CHANGED_EVENT, onPetalsChanged);
    };
  }, [refreshCount]);

  return (
    <InboxContext.Provider
      value={{ count, refreshCount, incrementCount, decrementCount }}
    >
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) {
    throw new Error("useInbox must be used within InboxProvider");
  }
  return ctx;
}

export function useOptionalInbox() {
  return useContext(InboxContext);
}
