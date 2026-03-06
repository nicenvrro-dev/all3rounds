"use client";

import { SearchResult } from "@/lib/types";
import EditLineModal from "./EditLineModal";
import SuggestCorrectionModal from "./SuggestCorrectionModal";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Mic2, MessageSquarePlus, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ResultCard({
  result,
  isLoggedIn,
  userRole = "viewer",
  isUserLoggedIn = false,
  onEdited,
  query = "",
}: {
  result: SearchResult;
  isLoggedIn: boolean;
  userRole?: string;
  isUserLoggedIn?: boolean;
  onEdited?: () => void;
  query?: string;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);

  const speaker = result.emcee?.name || result.speaker_label || "Unknown";

  const router = useRouter();

  return (
    <>
      <div
        onClick={() =>
          router.push(
            `/battle/${result.battle.id}?t=${Math.floor(result.start_time)}`,
          )
        }
        className="group block cursor-pointer py-4 transition-colors hover:bg-muted/30 sm:-mx-4 sm:px-4 sm:rounded-xl"
      >
        <div className="flex gap-4 sm:gap-6">
          {/* Thumbnail */}
          <div className="relative mt-1 hidden aspect-video w-36 shrink-0 self-start overflow-hidden rounded-md bg-muted sm:block">
            <Image
              src={`https://img.youtube.com/vi/${result.battle.youtube_id}/mqdefault.jpg`}
              alt={result.battle.title}
              fill
              sizes="144px"
              className="object-cover"
              unoptimized
            />
            {/* Timestamp badge */}
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white shadow-sm">
              {formatTime(result.start_time)}
            </span>
          </div>

          {/* Content */}
          <div className="relative flex flex-1 flex-col justify-center">
            {/* Top Right Actions */}
            <div className="absolute right-0 top-0 flex items-center">
              {isLoggedIn && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowEdit(true);
                  }}
                  className="h-8 w-8 text-muted-foreground hover:bg-primary/0 hover:text-foreground"
                  title="Edit this line"
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
              )}
              {isUserLoggedIn && !isLoggedIn && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSuggest(true);
                  }}
                  className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  title="Suggest a correction"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Meta section */}
            <div className="mb-5 pr-10">
              <span className="text-[15px] font-black uppercase text-primary/80">
                {speaker}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">
                <span>{result.battle.title}</span>
                {result.battle.event_name && (
                  <>
                    <span className="opacity-30">·</span>
                    <span>{result.battle.event_name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Lines Block (Best of Both Worlds) */}
            <div className="relative border-l border-white/10 pl-4 py-0.5">
              {/* Context Block: Single flow for all lines with truncation */}
              <div className="flex flex-col gap-1">
                {result.prev_line && (
                  <p className="line-clamp-1 text-[14px] font-medium leading-tight text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/50">
                    {result.prev_line.content}
                  </p>
                )}

                <div className="relative">
                  {/* Visual anchor for the target match */}
                  <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 h-3 w-[2px] bg-primary/40 rounded-full" />
                  <p className="text-[15px] font-semibold leading-relaxed text-foreground sm:text-[16px]">
                    {result.content}
                  </p>
                </div>

                {result.next_line && (
                  <p className="line-clamp-1 text-[14px] font-medium leading-tight text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/50">
                    {result.next_line.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <EditLineModal
          result={result}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            onEdited?.();
          }}
        />
      )}

      {/* Suggest modal */}
      {showSuggest && (
        <SuggestCorrectionModal
          result={result}
          onClose={() => setShowSuggest(false)}
        />
      )}
    </>
  );
}
