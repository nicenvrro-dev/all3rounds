import SearchBar from "@/components/SearchBar";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <main className="w-full max-w-2xl space-y-8 text-center">
        {/* Logo / Title */}
        <div className="space-y-3">
          <h1 className="text-6xl font-black tracking-tighter text-foreground uppercase pt-4 pb-2">
            talasalita
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            The ultimate battle rap verse directory — Find out which emcee spit
            that line.
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar autoFocus size="lg" />

        {/* Hints */}
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <Badge
            variant="secondary"
            className="hover:bg-primary/20 transition-colors cursor-default border border-transparent"
          >
            &quot;mula sa semento&quot;
          </Badge>
          <Badge
            variant="secondary"
            className="hover:bg-primary/20 transition-colors cursor-default border border-transparent"
          >
            &quot;suntukan sa southside&quot;
          </Badge>
          <Badge
            variant="secondary"
            className="hover:bg-primary/20 transition-colors cursor-default border border-transparent"
          >
            &quot;rapido&quot;
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground/70">
          No login required to search. Login to help improve transcriptions.
        </p>
      </main>
    </div>
  );
}
