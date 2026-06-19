import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  archiveDemoPetal,
  addDemoPetalNote,
  getDemoInboxCount,
  getDemoInboxPetals,
  markDemoPetalViewed,
  moveDemoPetalToCollection,
  moveDemoPetalToGarden,
} from "@/lib/demo-data";
import { getSupabaseClients, type DataContext } from "@/lib/data";
import type { InboxAction, Petal } from "@/lib/types";

const PETAL_COLUMNS =
  "id, user_id, url, title, platform, note, created_at, viewed, status, preview_url, theme, preview_status, description";

export async function getInboxPetals(ctx?: DataContext): Promise<Petal[]> {
  if (!isSupabaseConfigured()) return getDemoInboxPetals();

  const { supabase, userId } = await getSupabaseClients(ctx);
  if (!userId) return getDemoInboxPetals();

  const { data, error } = await supabase
    .from("petals")
    .select(PETAL_COLUMNS)
    .eq("user_id", userId)
    .eq("status", "inbox")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getInboxCount(ctx?: DataContext): Promise<number> {
  if (!isSupabaseConfigured()) return getDemoInboxCount();

  const { supabase, userId } = await getSupabaseClients(ctx);
  if (!userId) return getDemoInboxCount();

  const { count, error } = await supabase
    .from("petals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "inbox");

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function performInboxAction(
  petalId: string,
  inboxAction: InboxAction,
  ctx?: DataContext
): Promise<Petal> {
  if (!isSupabaseConfigured()) {
    return handleDemoInboxAction(petalId, inboxAction);
  }

  const { supabase, userId } = await getSupabaseClients(ctx);
  if (!userId) return handleDemoInboxAction(petalId, inboxAction);

  switch (inboxAction.action) {
    case "mark_viewed": {
      const { data, error } = await supabase
        .from("petals")
        .update({ status: "viewed", viewed: true })
        .eq("id", petalId)
        .eq("user_id", userId)
        .select(PETAL_COLUMNS)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    case "archive": {
      const { data, error } = await supabase
        .from("petals")
        .update({ status: "archived", viewed: true })
        .eq("id", petalId)
        .eq("user_id", userId)
        .select(PETAL_COLUMNS)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    case "add_note": {
      const { data, error } = await supabase
        .from("petals")
        .update({ note: inboxAction.note })
        .eq("id", petalId)
        .eq("user_id", userId)
        .select(PETAL_COLUMNS)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    case "move_to_collection": {
      const { error: linkError } = await supabase.from("collection_petals").upsert({
        collection_id: inboxAction.collection_id,
        petal_id: petalId,
      });
      if (linkError) throw new Error(linkError.message);

      const { data, error } = await supabase
        .from("petals")
        .update({ status: "viewed", viewed: true })
        .eq("id", petalId)
        .eq("user_id", userId)
        .select(PETAL_COLUMNS)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    case "move_to_garden": {
      const { data, error } = await supabase
        .from("petals")
        .update({
          theme: inboxAction.theme,
          status: "viewed",
          viewed: true,
        })
        .eq("id", petalId)
        .eq("user_id", userId)
        .select(PETAL_COLUMNS)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    default: {
      const _exhaustive: never = inboxAction;
      throw new Error(`Unknown action: ${(_exhaustive as InboxAction).action}`);
    }
  }
}

function handleDemoInboxAction(petalId: string, action: InboxAction): Petal {
  switch (action.action) {
    case "mark_viewed":
      return markDemoPetalViewed(petalId);
    case "archive":
      return archiveDemoPetal(petalId);
    case "add_note":
      return addDemoPetalNote(petalId, action.note);
    case "move_to_collection":
      return moveDemoPetalToCollection(petalId, action.collection_id);
    case "move_to_garden":
      return moveDemoPetalToGarden(petalId, action.theme);
    default: {
      const _exhaustive: never = action;
      throw new Error(`Unknown action: ${(_exhaustive as InboxAction).action}`);
    }
  }
}
