import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GRID,
  canPlace,
  clearLines,
  emptyBoard,
  hasAnyMove,
  newTray,
  place,
  type Board,
  type Piece,
} from "@/lib/blast";
import { Orb, orbColor } from "@/components/Orb";
import { Splash } from "@/components/Splash";
import { loadSoundPref, setSoundOn, sfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";

type Floater = { id: number; text: string };

let floatId = 0;

const PRAISE = ["NICE!", "GREAT!", "SUPERB!", "AMAZING!", "UNSTOPPABLE!", "LEGENDARY!"];
const praiseFor = (lines: number, streak: number) =>
  PRAISE[Math.min(lines + streak - 1, PRAISE.length - 1)]!;

export function BlastGame() {
  const [started, setStarted] = useState(false);
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [tray, setTray] = useState<Piece[]>([]);
  const [trayKey, setTrayKey] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sound, setSound] = useState(true);
  const [bursting, setBursting] = useState<Set<string>>(new Set());
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [banner, setBanner] = useState<{ id: number; text: string } | null>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const stored = Number(localStorage.getItem("orbblast-best") ?? 0);
    if (stored) setBest(stored);
    setSound(loadSoundPref());
  }, []);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem("orbblast-best", String(score));
    }
  }, [score, best]);

  const piece = useMemo(() => tray.find((p) => p.id === selected) ?? null, [tray, selected]);

  const anchor = useMemo(() => {
    if (!piece || !hover) return null;
    const r0 = Math.min(
      Math.max(hover.r - Math.floor((piece.shape.h - 1) / 2), 0),
      GRID - piece.shape.h,
    );
    const c0 = Math.min(
      Math.max(hover.c - Math.floor((piece.shape.w - 1) / 2), 0),
      GRID - piece.shape.w,
    );
    return { r0, c0, ok: canPlace(board, piece.shape, r0, c0) };
  }, [piece, hover, board]);

  const preview = useMemo(() => {
    if (!piece || !anchor) return new Map<string, boolean>();
    const m = new Map<string, boolean>();
    piece.shape.cells.forEach(([r, c]) => m.set(`${anchor.r0 + r}-${anchor.c0 + c}`, anchor.ok));
    return m;
  }, [piece, anchor]);

  const start = useCallback(() => {
    setBoard(emptyBoard());
    setTray(newTray());
    setTrayKey((k) => k + 1);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setOver(false);
    setBanner(null);
    setBursting(new Set());
    setStarted(true);
    sfx.start();
  }, []);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundOn(next);
    if (next) sfx.select();
  };

  const showBanner = (text: string) => {
    const id = floatId++;
    setBanner({ id, text });
    setTimeout(() => setBanner((b) => (b && b.id === id ? null : b)), 1100);
  };

  const commit = (p: Piece, r0: number, c0: number) => {
    const placed = place(board, p, r0, c0);
    const { board: cleared, clearedCells, lines } = clearLines(placed);

    let gained = p.shape.cells.length;
    let nextStreak = streak;
    if (lines > 0) {
      nextStreak = streak + 1;
      gained += lines * 10 * lines + nextStreak * 5;
      setBursting(new Set(clearedCells));
      const id = floatId++;
      setFloaters((f) => [...f, { id, text: `+${gained}` }]);
      setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 900);
      showBanner(lines > 1 ? `${lines}x COMBO · ${praiseFor(lines, nextStreak)}` : praiseFor(lines, nextStreak));
      if (lines > 1 || nextStreak > 1) sfx.combo();
      sfx.clear(lines);
      setTimeout(() => {
        setBoard(cleared);
        setBursting(new Set());
      }, 280);
      setBoard(placed);
    } else {
      nextStreak = 0;
      setBoard(placed);
      sfx.place();
    }
    setStreak(nextStreak);
    setScore((s) => s + gained);

    const remaining = tray.filter((t) => t.id !== p.id);
    const nextTray = remaining.length === 0 ? newTray() : remaining;
    if (remaining.length === 0) setTrayKey((k) => k + 1);
    setTray(nextTray);
    setSelected(null);
    setHover(null);

    setTimeout(() => {
      if (!hasAnyMove(lines > 0 ? cleared : placed, nextTray)) {
        setOver(true);
        sfx.over();
      }
    }, 320);
  };

  const onCellEnter = (r: number, c: number) => setHover({ r, c });

  const onCellClick = () => {
    if (!piece || !anchor || !anchor.ok) return;
    commit(piece, anchor.r0, anchor.c0);
  };

  const trayPlayable = (p: Piece) => {
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++) if (canPlace(board, p.shape, r, c)) return true;
    return false;
  };

  const newBest = over && score > 0 && score >= best;

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="font-display text-[0.65rem] tracking-[0.4em] text-muted-foreground uppercase">
            Orb
          </p>
          <h1 className="font-display text-3xl leading-none font-extrabold tracking-tight">
            BLAST
          </h1>
        </div>
        <div className="flex items-center gap-3 text-right">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={sound ? "Mute sound" : "Unmute sound"}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/50 bg-surface/60 text-base backdrop-blur transition-transform hover:scale-105"
          >
            <span aria-hidden>{sound ? "🔊" : "🔈"}</span>
          </button>
          <Stat label="Score" value={score} glow />
          <Stat label="Best" value={best} />
        </div>
      </header>

      <div className="relative rounded-[2rem] border border-border/60 bg-surface/70 p-3 backdrop-blur-xl shadow-[var(--shadow-board)]">
        <div
          className="grid gap-[3px] rounded-[1.5rem] bg-surface-2/40 p-[6px]"
          style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))` }}
          onPointerLeave={() => setHover(null)}
        >
          {board.map((row, r) =>
            row.map((v, c) => {
              const key = `${r}-${c}`;
              const prev = preview.get(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`cell ${r + 1} ${c + 1}`}
                  onPointerEnter={() => onCellEnter(r, c)}
                  onPointerDown={() => onCellEnter(r, c)}
                  onClick={onCellClick}
                  className="relative aspect-square rounded-full outline-none"
                >
                  <span
                    className={cn(
                      "absolute inset-[14%] rounded-full border border-border/40 bg-background/30 transition-colors",
                      prev === false && "border-destructive/70",
                    )}
                  />
                  {v !== null && (
                    <span
                      className={cn("absolute inset-0 orb-pop", bursting.has(key) && "orb-burst")}
                    >
                      <Orb color={v} />
                    </span>
                  )}
                  {v === null && prev && piece && (
                    <span className="absolute inset-[6%] animate-pulse">
                      <Orb color={piece.color} ghost />
                    </span>
                  )}
                </button>
              );
            }),
          )}
        </div>

        {floaters.map((f) => (
          <span
            key={f.id}
            className="font-display float-up pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 text-xl font-bold text-accent"
            style={{ textShadow: "0 0 18px color-mix(in oklab, var(--accent) 70%, transparent)" }}
          >
            {f.text}
          </span>
        ))}

        {banner && (
          <span
            key={banner.id}
            className="font-display banner-in pointer-events-none absolute top-[38%] left-1/2 -translate-x-1/2 text-2xl font-extrabold whitespace-nowrap text-primary"
            style={{ textShadow: "0 0 26px color-mix(in oklab, var(--primary) 75%, transparent)" }}
          >
            {banner.text}
          </span>
        )}

        {over && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-background/85 backdrop-blur-md">
            {newBest && (
              <p className="font-display text-sm tracking-[0.3em] text-accent uppercase">
                🎉 New best!
              </p>
            )}
            <p className="font-display text-2xl font-extrabold">
              {newBest ? "Congratulations!" : "No moves left"}
            </p>
            <p className="text-sm text-muted-foreground">
              You scored <span className="text-accent">{score}</span>
            </p>
            <button
              onClick={start}
              className="font-display rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_0_28px_color-mix(in_oklab,var(--primary)_55%,transparent)] transition-transform hover:scale-105"
            >
              Play again
            </button>
          </div>
        )}

        {!started && <Splash best={best} onStart={start} />}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {tray.map((p, i) => {
          const playable = trayPlayable(p);
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={!playable}
              onClick={() => {
                setSelected(active ? null : p.id);
                if (!active) sfx.select();
              }}
              className={cn(
                "tray-in flex aspect-square items-center justify-center rounded-3xl border border-border/50 bg-surface/60 p-3 backdrop-blur transition-all",
                active && "border-accent/70 scale-[1.04]",
                !playable && "opacity-30",
              )}
              style={{
                animationDelay: `${i * 70}ms`,
                ...(active
                  ? {
                      boxShadow: `0 0 30px color-mix(in oklab, ${orbColor(p.color)} 45%, transparent)`,
                    }
                  : {}),
              }}
              data-tray={trayKey}
            >
              <div
                className="grid gap-[3px]"
                style={{
                  gridTemplateColumns: `repeat(${p.shape.w}, 1fr)`,
                  width: `${Math.min(p.shape.w, 5) * 18}px`,
                }}
              >
                {Array.from({ length: p.shape.w * p.shape.h }).map((_, idx) => {
                  const r = Math.floor(idx / p.shape.w);
                  const c = idx % p.shape.w;
                  const filled = p.shape.cells.some(([a, b]) => a === r && b === c);
                  return (
                    <span key={idx} className="aspect-square">
                      {filled && <Orb color={p.color} />}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Tap a cluster, then tap the grid to drop it. Fill a full row or column to blast it.
      </p>
    </div>
  );
}

function Stat({ label, value, glow }: { label: string; value: number; glow?: boolean }) {
  return (
    <div className="min-w-16 rounded-2xl border border-border/50 bg-surface/60 px-3 py-1.5 backdrop-blur">
      <p className="text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
      <p
        className={cn("font-display text-lg font-bold tabular-nums", glow && "text-accent")}
        style={
          glow
            ? { textShadow: "0 0 16px color-mix(in oklab, var(--accent) 60%, transparent)" }
            : undefined
        }
      >
        {value}
      </p>
    </div>
  );
}
