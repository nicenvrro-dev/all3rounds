import Link from "next/link";
import { Emcee } from "../types";

interface EmceeCardProps {
  emcee: Emcee;
}

export function EmceeCard({ emcee }: EmceeCardProps) {
  return (
    <Link
      href={`/emcees/${emcee.id}`}
      className="group hover:border-primary/20 hover:shadow-primary/5 relative flex min-h-40 flex-col justify-between rounded-3xl border border-white/5 bg-[#141417] p-6 transition-all duration-500 hover:shadow-2xl active:scale-[0.98]"
    >
      <div className="bg-primary/5 absolute top-0 right-0 h-24 w-24 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />

      <div>
        <div className="mb-2 flex items-start justify-between">
          <h2 className="group-hover:text-primary text-xl font-bold tracking-tight text-white transition-colors">
            {emcee.name}
          </h2>
          <div className="border-border/50 bg-muted/5 text-muted-foreground group-hover:border-primary/10 group-hover:bg-primary/5 group-hover:text-primary flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 transition-all duration-500">
            <span className="text-[10px]"> {emcee.battle_count}</span>
            <span className="text-[10px] tracking-tighter uppercase opacity-70">
              Battles
            </span>
          </div>
        </div>
        
        {emcee.aka && emcee.aka.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {emcee.aka.slice(0, 3).map((alias) => (
              <span key={alias} className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors">
                • {alias}
              </span>
            ))}
            {emcee.aka.length > 3 && (
              <span className="text-[10px] text-white/20">
                +{emcee.aka.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
