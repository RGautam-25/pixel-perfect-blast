import { cn } from "@/lib/utils";

const ORB_VARS = [
  "var(--orb-1)",
  "var(--orb-2)",
  "var(--orb-3)",
  "var(--orb-4)",
  "var(--orb-5)",
  "var(--orb-6)",
];

export function orbColor(i: number) {
  return ORB_VARS[i % ORB_VARS.length]!;
}

export function Orb({
  color,
  className,
  ghost = false,
  style,
}: {
  color: number;
  className?: string;
  ghost?: boolean;
  style?: React.CSSProperties;
}) {
  const c = orbColor(color);
  return (
    <span
      className={cn("block h-full w-full rounded-full", className)}
      style={{
        background: ghost
          ? `radial-gradient(circle at 32% 28%, color-mix(in oklab, ${c} 55%, transparent), color-mix(in oklab, ${c} 18%, transparent) 70%)`
          : `radial-gradient(circle at 30% 26%, color-mix(in oklab, ${c} 96%, white 30%), ${c} 52%, color-mix(in oklab, ${c} 62%, black) 100%)`,
        boxShadow: ghost
          ? `inset 0 0 0 1px color-mix(in oklab, ${c} 45%, transparent)`
          : `0 0 14px color-mix(in oklab, ${c} 50%, transparent), inset 0 -2px 6px color-mix(in oklab, ${c} 40%, black), inset 0 2px 4px color-mix(in oklab, white 45%, transparent)`,
        ...style,
      }}
    />
  );
}
