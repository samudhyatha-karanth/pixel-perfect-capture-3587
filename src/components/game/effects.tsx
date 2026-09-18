import { useMemo } from "react";

const PETALS = ["🌼", "🌸", "🏵️", "✨"];

export function Petals({ count = 14 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 12 + Math.random() * 12,
        size: 12 + Math.random() * 16,
        glyph: PETALS[i % PETALS.length],
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {items.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-[-10vh] select-none opacity-70"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}

export function DiyaRow({ count = 7 }: { count?: number }) {
  return (
    <div className="pointer-events-none flex justify-between px-2" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="animate-flicker text-lg drop-shadow-[0_0_10px_var(--marigold)]"
          style={{ animationDelay: `${i * 0.22}s` }}
        >
          🪔
        </span>
      ))}
    </div>
  );
}

export function Mushak({ className = "", mood = "🐭" }: { className?: string; mood?: string }) {
  return (
    <div className={`relative grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-marigold to-magenta text-2xl glow-ring ${className}`}>
      <span>{mood}</span>
    </div>
  );
}
