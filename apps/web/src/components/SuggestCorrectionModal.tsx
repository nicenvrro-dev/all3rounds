"use client";

import { SearchResult } from "@/lib/types";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function SuggestCorrectionModal({
  result,
  onClose,
}: {
  result: SearchResult;
  onClose: () => void;
}) {
  const [suggestion, setSuggestion] = useState(result.content);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!suggestion || suggestion === result.content) {
      onClose();
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_id: result.id,
          suggested_content: suggestion,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Suggest Correction</DialogTitle>
          <DialogDescription>
            Help improve the transcript. Your suggestion will be reviewed by our
            team.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">
                Suggestion Submitted
              </h3>
              <p className="text-sm text-muted-foreground">
                Thank you! Your correction has been sent for review.
              </p>
            </div>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  Original Line
                </Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground italic">
                  &ldquo;{result.content}&rdquo;
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="suggestion"
                  className="text-xs text-muted-foreground uppercase tracking-wider font-bold"
                >
                  Suggested Correction
                </Label>
                <Textarea
                  id="suggestion"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Type the corrected line here..."
                  rows={4}
                  autoFocus
                  className="resize-none focus-visible:ring-primary"
                />
              </div>

              <div className="text-[11px] text-muted-foreground bg-muted/20 p-2 rounded border border-dashed flex items-start gap-1.5">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0 opacity-60" />
                <span>
                  Only suggest changes if you're sure about the lyrics or
                  labels. Minor formatting is fine.
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting || !suggestion || suggestion === result.content
                }
                className="gap-2"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {submitting ? "Submitting..." : "Submit Suggestion"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
