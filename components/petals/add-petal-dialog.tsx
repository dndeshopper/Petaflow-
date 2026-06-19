"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePetals } from "@/components/petals/petals-provider";

interface AddPetalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPetalDialog({ open, onOpenChange }: AddPetalDialogProps) {
  const { addPetal, isCreating } = usePetals();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setFormError("URL is required");
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setFormError("Enter a valid URL");
      return;
    }

    try {
      await addPetal({
        url: trimmedUrl,
        title: title.trim() || undefined,
        note: note.trim() || undefined,
      });
      setUrl("");
      setTitle("");
      setNote("");
      onOpenChange(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save petal"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new petal</DialogTitle>
          <DialogDescription>
            Save a link to your timeline. It appears instantly while we persist
            it in the background.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="petal-url" className="text-sm font-medium">
              URL
            </label>
            <Input
              id="petal-url"
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="petal-title" className="text-sm font-medium">
              Title <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="petal-title"
              placeholder="Page title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="petal-note" className="text-sm font-medium">
              Note <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="petal-note"
              placeholder="Why you saved this"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Saving…" : "Save petal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
