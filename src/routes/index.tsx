import { createFileRoute } from "@tanstack/react-router";
import { BlastGame } from "@/components/BlastGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orb Blast — Neon Block Puzzle Game" },
      {
        name: "description",
        content:
          "Orb Blast is a glowing 8x8 block puzzle: drop orb clusters, fill rows and columns, and chain combos for a high score.",
      },
      { property: "og:title", content: "Orb Blast — Neon Block Puzzle Game" },
      {
        property: "og:description",
        content: "Drop glowing orb clusters, clear lines and chain combos in this neon puzzle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full blur-3xl aurora"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 35%, transparent), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-52 -left-24 h-[460px] w-[460px] rounded-full blur-3xl aurora"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent) 30%, transparent), transparent 65%)",
        }}
      />
      <div className="relative z-10">
        <BlastGame />
      </div>
    </main>
  );
}
