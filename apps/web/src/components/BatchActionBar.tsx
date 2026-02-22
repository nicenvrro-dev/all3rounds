"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2, X, Search, User } from "lucide-react";
import type { Emcee } from "@/lib/types";
import EmceeSearchModal from "./EmceeSearchModal";

export default function BatchActionBar({
  selectedCount,
  selectedIds,
  emcees: externalEmcees,
  onAction,
  onClear,
  saving,
  canDelete,
}: {
  selectedCount: number;
  selectedIds: Set<number>;
  emcees?: Emcee[];
  onAction: (
    action: "set_round" | "set_emcee" | "delete",
    value?: string,
  ) => Promise<void>;
  onClear: () => void;
  saving: boolean;
  canDelete?: boolean;
}) {
  const [emcees, setEmcees] = useState<Emcee[]>(externalEmcees || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEmceeModalOpen, setIsEmceeModalOpen] = useState(false);

  // Sync local state when externalEmcees prop changes
  useEffect(() => {
    if (externalEmcees && externalEmcees.length > 0) {
      setEmcees(externalEmcees);
    }
  }, [externalEmcees]);

  // Fetch emcees if not provided or empty
  useEffect(() => {
    if (!externalEmcees || externalEmcees.length === 0) {
      fetch("/api/emcees")
        .then((r) => r.json())
        .then(setEmcees)
        .catch(() => {});
    }
  }, [externalEmcees]);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm shadow-xl md:shadow-lg safe-bottom">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 p-3 md:flex-row md:items-center md:gap-3 md:px-4 md:py-3">
          <div className="flex items-center justify-between md:justify-start md:gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 md:text-sm md:font-medium md:normal-case md:text-foreground">
              {selectedCount} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={saving}
              className="h-7 px-2 md:hidden"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-1.5 md:gap-2">
            {/* Set Round */}
            <Select
              disabled={saving}
              onValueChange={(val) => onAction("set_round", val)}
            >
              <SelectTrigger className="h-8 flex-1 md:h-9 md:w-[130px] md:flex-none">
                <SelectValue placeholder="Round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Clear Round</SelectItem>
                <SelectItem value="1">Round 1</SelectItem>
                <SelectItem value="2">Round 2</SelectItem>
                <SelectItem value="3">Round 3</SelectItem>
              </SelectContent>
            </Select>

            {/* Set Emcee */}
            <button
              disabled={saving}
              onClick={() => setIsEmceeModalOpen(true)}
              className="flex cursor-pointer h-8 flex-1 md:h-9 md:w-[150px] md:flex-none items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-xs md:text-sm shadow-sm hover:bg-muted/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center gap-2 truncate">
                <User className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
                <span className="truncate">Emcee</span>
              </div>
              <Search className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground shrink-0" />
            </button>

            {/* Delete */}
            {canDelete && (
              <Button
                variant="destructive"
                size="sm"
                disabled={saving}
                onClick={() => setShowDeleteConfirm(true)}
                className="h-8 flex-1 md:h-9 md:flex-none"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={saving}
              className="hidden h-9 md:flex"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
          </div>

          <EmceeSearchModal
            isOpen={isEmceeModalOpen}
            onClose={() => setIsEmceeModalOpen(false)}
            emcees={emcees}
            selectedId=""
            onSelect={(val) => onAction("set_emcee", val)}
          />
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedCount} line{selectedCount !== 1 ? "s" : ""}?
            </DialogTitle>
            <DialogDescription>
              This will permanently remove the selected lines. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={saving}
              onClick={async () => {
                await onAction("delete");
                setShowDeleteConfirm(false);
              }}
            >
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
