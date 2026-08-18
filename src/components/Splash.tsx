import { Orb } from "@/components/Orb";

export function Splash({ best, onStart }: { best: number; onStart: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-8 rounded-[2rem] bg-background/85 px-6 text-center backdrop-blur-xl">
      <div className="relative flex h-40 w-40 items-center justify-center">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="orbit absolute h-6 w-6"
            style={{ animationDelay: `${-i * 1.5}s` }}
          >
            <Orb color={i} />
          </span>
        ))}
        <div className="title-glow">
          <p className="font-display text-[0.7rem] tracking-[0.55em] text-muted-foreground uppercase">
            Orb
          </p>
          <h1 className="font-display text-4xl leading-none font-extrabold tracking-tight">
            BLAST
          </h1>
        </div>
      </div>

      <div className="splash-in flex flex-col items-center gap-4">
        <p className="max-w-xs text-sm text-muted-foreground">
          Drop glowing clusters, fill rows and columns, and chain combos for huge scores.
        </p>
        {best > 0 && (
          <p className="font-display text-xs tracking-[0.3em] text-accent uppercase">
            Best {best}
          </p>
        )}
        <button
          onClick={onStart}
          className="font-display rounded-full bg-primary px-10 py-3 text-sm font-bold tracking-wide text-primary-foreground shadow-[0_0_36px_color-mix(in_oklab,var(--primary)_60%,transparent)] transition-transform hover:scale-105 active:scale-95"
        >
          PLAY
        </button>
      </div>
    </div>
  );
}
