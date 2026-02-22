"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, User, Clock, Plus } from "lucide-react";
import type { Emcee } from "@/lib/types";
import EmceeSearchModal from "./EmceeSearchModal";

export default function BattleAddLineModal({
  battleId,
  currentTime,
  emcees,
  onClose,
  onSaved,
  initialData,
}: {
  battleId: string;
  currentTime: number;
  emcees: Emcee[];
  onClose: () => void;
  onSaved: () => void;
  initialData?: {
    start_time?: number;
    end_time?: number;
    round_number?: number | null;
    emcee_id?: string | null;
  };
}) {
  const [content, setContent] = useState("");
  const [startTime, setStartTime] = useState(
    initialData?.start_time?.toFixed(2) || currentTime.toFixed(2),
  );
  const [endTime, setEndTime] = useState(
    initialData?.end_time?.toFixed(2) || (currentTime + 2).toFixed(2),
  );
  const [roundNumber, setRoundNumber] = useState(
    initialData?.round_number?.toString() || "1",
  );
  const [emceeId, setEmceeId] = useState(initialData?.emcee_id || "none");
  const [isEmceeModalOpen, setIsEmceeModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedEmcee = useMemo(() => {
    if (emceeId === "none") return null;
    return emcees.find((e) => e.id === emceeId);
  }, [emceeId, emcees]);

  const handleSave = async () => {
    if (!content.trim()) {
      setError("Content is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          battle_id: battleId,
          content: content.trim(),
          start_time: parseFloat(startTime),
          end_time: parseFloat(endTime),
          emcee_id: emceeId,
          round_number: roundNumber,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save.");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add New Line
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-4 py-2">
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="add-line-content">Content</Label>
            <Textarea
              id="add-line-content"
              placeholder="What was said?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none h-24"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Start (s)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                End (s)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Round */}
            <div className="space-y-2">
              <Label>Round</Label>
              <Select value={roundNumber} onValueChange={setRoundNumber}>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select Round" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unknown</SelectItem>
                  <SelectItem value="1">Round 1</SelectItem>
                  <SelectItem value="2">Round 2</SelectItem>
                  <SelectItem value="3">Round 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Emcee Trigger */}
            <div className="space-y-2">
              <Label>Emcee</Label>
              <button
                type="button"
                onClick={() => setIsEmceeModalOpen(true)}
                className="flex items-center justify-between w-full px-3 h-9 text-sm border rounded-md bg-background hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    {selectedEmcee?.name || "Unknown"}
                  </span>
                </div>
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Add Line"}
          </Button>
        </DialogFooter>

        <EmceeSearchModal
          isOpen={isEmceeModalOpen}
          onClose={() => setIsEmceeModalOpen(false)}
          emcees={emcees}
          selectedId={emceeId}
          onSelect={setEmceeId}
        />
      </DialogContent>
    </Dialog>
  );
}
