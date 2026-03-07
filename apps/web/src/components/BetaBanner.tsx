"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BetaBanner() {
  const [isVisible, setIsVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const hidden = localStorage.getItem("beta-banner-hidden");
    if (hidden === "true") {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("beta-banner-hidden", "true");
  };

  if (isVisible === false || isVisible === null) return null;

  return (
    <div className="relative z-50 w-full bg-primary/5 border-b border-primary/10 py-2 px-4 shadow-[0_1px_2px_rgba(0,0,0,0,02)] animate-in fade-in slide-in-from-top-1 duration-500">
      <div className="mx-auto max-w-5xl flex items-center justify-center gap-3 relative">
        <Badge className="rounded-sm bg-primary text-primary-foreground text-[9px] font-black uppercase px-1.5 py-0.5 hover:bg-primary pointer-events-none tracking-tighter">
          Beta
        </Badge>
        <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground/90 tracking-tight leading-tight max-w-[80vw] sm:max-w-none text-center">
          Some transcripts may contain inaccuracies.{" "}
          <Link
            href="/random"
            className="text-primary hover:underline underline-offset-2 transition-colors inline-flex items-center gap-0.5"
          >
            Help improve them.
          </Link>
        </p>

        <button
          onClick={handleClose}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/40 hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
