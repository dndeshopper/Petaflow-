"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CreatePetalInput, Petal } from "@/lib/types";
import {
  createOptimisticPetal,
  createPetalRequest,
  fetchPetals,
} from "@/lib/petals/client";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useOptionalInbox } from "@/components/inbox/inbox-provider";
import { PETALS_CHANGED_EVENT } from "@/lib/sync-events";

interface PetalsContextValue {
  petals: Petal[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  newTodayCount: number;
  addPetal: (input: CreatePetalInput) => Promise<Petal>;
  refreshPetals: () => Promise<void>;
}

const PetalsContext = createContext<PetalsContextValue | null>(null);

function countNewToday(petals: Petal[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return petals.filter((p) => new Date(p.created_at) >= today).length;
}

interface PetalsProviderProps {
  initialPetals: Petal[];
  userId: string;
  children: React.ReactNode;
}

export function PetalsProvider({
  initialPetals,
  userId,
  children,
}: PetalsProviderProps) {
  const [petals, setPetals] = useState<Petal[]>(initialPetals);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inbox = useOptionalInbox();

  const refreshPetals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await fetchPetals();
      setPetals(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load petals");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPetal = useCallback(
    async (input: CreatePetalInput): Promise<Petal> => {
      const optimistic = createOptimisticPetal(input, userId);
      setPetals((prev) => [optimistic, ...prev]);
      setIsCreating(true);
      setError(null);

      try {
        const saved = await createPetalRequest(input);
        setPetals((prev) =>
          prev.map((p) => (p.id === optimistic.id ? saved : p))
        );
        inbox?.incrementCount();
        return saved;
      } catch (err) {
        setPetals((prev) => prev.filter((p) => p.id !== optimistic.id));
        const message =
          err instanceof Error ? err.message : "Failed to create petal";
        setError(message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [userId, inbox]
  );

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshPetals();
        void inbox?.refreshCount();
      }
    };
    const onPetalsChanged = () => {
      void refreshPetals();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(PETALS_CHANGED_EVENT, onPetalsChanged);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(PETALS_CHANGED_EVENT, onPetalsChanged);
    };
  }, [refreshPetals, inbox]);

  useEffect(() => {
    if (isSupabaseConfigured()) return;

    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refreshPetals();
      void inbox?.refreshCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshPetals, inbox]);

  useEffect(() => {
    const hasPendingPreview = petals.some(
      (p) =>
        p.preview_status === "pending" || p.preview_status === "processing"
    );
    if (!hasPendingPreview) return;

    const interval = setInterval(() => {
      void refreshPetals();
    }, 4000);

    return () => clearInterval(interval);
  }, [petals, refreshPetals]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    const mergePetalUpdate = (incoming: Petal) => {
      setPetals((prev) => {
        const index = prev.findIndex((p) => p.id === incoming.id);
        if (index === -1) return prev;
        const next = [...prev];
        next[index] = { ...next[index], ...incoming };
        return next;
      });
    };

    const channel = supabase
      .channel("petals-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "petals" },
        (payload) => {
          const incoming = payload.new as Petal;
          if (incoming.user_id !== userId) return;
          setPetals((prev) => {
            if (prev.some((p) => p.id === incoming.id)) return prev;
            const withoutOptimistic = prev.filter(
              (p) => !p.id.startsWith("optimistic-") || p.url !== incoming.url
            );
            return [incoming, ...withoutOptimistic];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "petals" },
        (payload) => {
          const incoming = payload.new as Petal;
          if (incoming.user_id !== userId) return;
          mergePetalUpdate(incoming);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  const value = useMemo(
    () => ({
      petals,
      isLoading,
      isCreating,
      error,
      newTodayCount: countNewToday(petals),
      addPetal,
      refreshPetals,
    }),
    [petals, isLoading, isCreating, error, addPetal, refreshPetals]
  );

  return (
    <PetalsContext.Provider value={value}>{children}</PetalsContext.Provider>
  );
}

export function usePetals() {
  const ctx = useContext(PetalsContext);
  if (!ctx) {
    throw new Error("usePetals must be used within PetalsProvider");
  }
  return ctx;
}
