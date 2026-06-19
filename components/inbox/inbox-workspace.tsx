"use client";

import { useState } from "react";
import {
  Archive,
  Check,
  FolderPlus,
  Leaf,
  MessageSquarePlus,
} from "lucide-react";
import { PetalCard } from "@/components/petals/petal-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInbox } from "@/components/inbox/inbox-provider";
import { performInboxActionRequest } from "@/lib/inbox/client";
import { notifyPetalsChanged } from "@/lib/sync-events";
import { design } from "@/lib/design-tokens";
import { THEMES } from "@/lib/platforms";
import type { Collection, GardenTopic, InboxAction, Petal } from "@/lib/types";

interface InboxWorkspaceProps {
  initialPetals: Petal[];
  collections: Collection[];
  gardenTopics: GardenTopic[];
}

export function InboxWorkspace({
  initialPetals,
  collections,
  gardenTopics,
}: InboxWorkspaceProps) {
  const { decrementCount, refreshCount } = useInbox();
  const [petals, setPetals] = useState(initialPetals);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteDialog, setNoteDialog] = useState<Petal | null>(null);
  const [collectionDialog, setCollectionDialog] = useState<Petal | null>(null);
  const [gardenDialog, setGardenDialog] = useState<Petal | null>(null);
  const [noteText, setNoteText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function runAction(
    petalId: string,
    action: InboxAction,
    removeFromInbox = true
  ) {
    setBusyId(petalId);
    setError(null);
    try {
      const updated = await performInboxActionRequest(petalId, action);
      if (removeFromInbox && updated.status !== "inbox") {
        setPetals((prev) => prev.filter((p) => p.id !== petalId));
        decrementCount();
      } else {
        setPetals((prev) =>
          prev.map((p) => (p.id === petalId ? updated : p))
        );
      }
      await refreshCount();
      notifyPetalsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  function openNoteDialog(petal: Petal) {
    setNoteText(petal.note ?? "");
    setNoteDialog(petal);
  }

  return (
    <div className="px-4 pb-10 sm:px-8">
      <div
        className="border-b pb-6 pt-2"
        style={{ borderColor: design.colors.border }}
      >
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: design.colors.text, fontFamily: design.font }}
        >
          Inbox
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: design.colors.textMuted }}>
          {petals.length} petal{petals.length !== 1 ? "s" : ""} waiting to be
          processed
        </p>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {petals.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-4xl">🌸</div>
          <p
            className="mt-4 text-[15px] font-semibold"
            style={{ color: design.colors.text }}
          >
            Inbox zero
          </p>
          <p className="mt-1 text-[13px]" style={{ color: design.colors.textMuted }}>
            New petals will appear here when you save links.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {petals.map((petal) => (
            <div key={petal.id} className="space-y-3">
              <div className="flex justify-center">
                <PetalCard petal={petal} />
              </div>
              <InboxActionBar
                disabled={busyId === petal.id}
                onMarkViewed={() => runAction(petal.id, { action: "mark_viewed" })}
                onArchive={() => runAction(petal.id, { action: "archive" })}
                onAddNote={() => openNoteDialog(petal)}
                onMoveCollection={() => setCollectionDialog(petal)}
                onMoveGarden={() => setGardenDialog(petal)}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!noteDialog} onOpenChange={() => setNoteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add note</DialogTitle>
          </DialogHeader>
          <Input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Why did you save this?"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNoteDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!noteDialog) return;
                void runAction(
                  noteDialog.id,
                  { action: "add_note", note: noteText.trim() },
                  false
                );
                setNoteDialog(null);
              }}
              disabled={!noteText.trim()}
            >
              Save note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!collectionDialog}
        onOpenChange={() => setCollectionDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to collection</DialogTitle>
          </DialogHeader>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {collections.map((collection) => (
              <button
                key={collection.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50"
                onClick={() => {
                  if (!collectionDialog) return;
                  void runAction(collectionDialog.id, {
                    action: "move_to_collection",
                    collection_id: collection.id,
                  });
                  setCollectionDialog(null);
                }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: collection.color }}
                />
                <span className="font-medium">{collection.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {collection.petal_count} petals
                </span>
              </button>
            ))}
            {collections.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No collections yet. Create one from the Collections page.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!gardenDialog} onOpenChange={() => setGardenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to garden</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Assign a topic — your garden grows with every petal.
          </p>
          <div className="flex flex-wrap gap-2">
            {[...new Set([...THEMES, ...gardenTopics.map((t) => t.name)])].map(
              (theme) => (
                <button
                  key={theme}
                  type="button"
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-violet-400 hover:bg-violet-50"
                  onClick={() => {
                    if (!gardenDialog) return;
                    void runAction(gardenDialog.id, {
                      action: "move_to_garden",
                      theme,
                    });
                    setGardenDialog(null);
                  }}
                >
                  {theme}
                </button>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InboxActionBar({
  disabled,
  onMarkViewed,
  onArchive,
  onAddNote,
  onMoveCollection,
  onMoveGarden,
}: {
  disabled?: boolean;
  onMarkViewed: () => void;
  onArchive: () => void;
  onAddNote: () => void;
  onMoveCollection: () => void;
  onMoveGarden: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-[340px] flex-wrap items-center justify-center gap-1.5">
      <InboxActionButton
        icon={Check}
        label="Mark viewed"
        onClick={onMarkViewed}
        disabled={disabled}
      />
      <InboxActionButton
        icon={Archive}
        label="Archive"
        onClick={onArchive}
        disabled={disabled}
      />
      <InboxActionButton
        icon={MessageSquarePlus}
        label="Add note"
        onClick={onAddNote}
        disabled={disabled}
      />
      <InboxActionButton
        icon={FolderPlus}
        label="Collection"
        onClick={onMoveCollection}
        disabled={disabled}
      />
      <InboxActionButton
        icon={Leaf}
        label="Garden"
        onClick={onMoveGarden}
        disabled={disabled}
      />
    </div>
  );
}

function InboxActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Check;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-muted/60 disabled:opacity-50"
      style={{ borderColor: design.colors.borderInput, color: design.colors.textSecondary }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
