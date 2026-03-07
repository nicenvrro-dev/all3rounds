export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 py-6 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:items-center md:justify-between gap-6 md:flex-row">
          <div className="flex flex-col gap-2 scale-90 md:scale-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/70">
              Disclaimer
            </h3>
            <p className="max-w-md text-[10px] leading-relaxed text-muted-foreground/60">
              All3Rounds is a non-profit educational project. This site is currently in **Beta**;
              transcripts are AI-generated and may contain inaccuracies. All rights belong to their
              respective owners.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-medium tracking-tight text-muted-foreground/30">
              © {new Date().getFullYear()} All3Rounds.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
