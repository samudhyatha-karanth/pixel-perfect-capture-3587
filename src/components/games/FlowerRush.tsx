import { useEffect, useRef, useState } from "react";
import { GameFrame, type MiniGameProps } from "./GameFrame";
import { ProgressBar } from "@/components/game/ui";

type Item = { id: number; x: number; y: number; speed: number; kind: "flower" | "chili" | "gold" };

const DURATION = 35;

export function FlowerRush({ onExit, onFinish }: MiniGameProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [pop, setPop] = useState<{ id: number; x: number; y: number; text: string } | null>(null);
  const nextId = useRef(1);
  const done = useRef(false);

  useEffect(() => {
    const tick = setInterval(() => setTime((t) => t - 1), 1000);
    const spawn = setInterval(() => {
      setItems((prev) => {
        const roll = Math.random();
        const kind: Item["kind"] = roll > 0.86 ? "gold" : roll > 0.7 ? "chili" : "flower";
        return [
          ...prev.slice(-14),
          { id: nextId.current++, x: 6 + Math.random() * 82, y: -8, speed: 0.55 + Math.random() * 0.75, kind },
        ];
      });
    }, 520);
    return () => {
      clearInterval(tick);
      clearInterval(spawn);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setItems((prev) => prev.map((i) => ({ ...i, y: i.y + i.speed })).filter((i) => i.y < 108));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (time <= 0 && !done.current) {
      done.current = true;
      onFinish(Math.max(0, score));
    }
  }, [time, score, onFinish]);

  const tap = (item: Item) => {
    const delta = item.kind === "gold" ? 35 : item.kind === "chili" ? -15 : 15;
    setScore((s) => Math.max(0, s + delta));
    setPop({ id: item.id, x: item.x, y: item.y, text: delta > 0 ? `+${delta}` : `${delta}` });
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setTimeout(() => setPop((p) => (p && p.id === item.id ? null : p)), 500);
  };

  return (
    <GameFrame
      title="Flower Rush"
      hint="Tap marigolds 🌼 and golden blooms 🏵️ — avoid the chillies 🌶️"
      score={score}
      onExit={onExit}
      meta={
        <div>
          <div className="mb-1 flex justify-between text-[0.7rem] text-muted-foreground">
            <span>Time</span>
            <span>{Math.max(0, time)}s</span>
          </div>
          <ProgressBar value={Math.max(0, time) / DURATION} />
        </div>
      }
    >
      <div className="surface relative h-[62dvh] w-full overflow-hidden rounded-3xl">
        {items.map((i) => (
          <button
            key={i.id}
            onPointerDown={() => tap(i)}
            style={{ left: `${i.x}%`, top: `${i.y}%` }}
            className="absolute -translate-x-1/2 text-3xl active:scale-90"
          >
            {i.kind === "gold" ? "🏵️" : i.kind === "chili" ? "🌶️" : "🌼"}
          </button>
        ))}
        {pop && (
          <span
            style={{ left: `${pop.x}%`, top: `${pop.y}%` }}
            className="pointer-events-none absolute -translate-x-1/2 text-sm font-extrabold text-primary"
          >
            {pop.text}
          </span>
        )}
      </div>
    </GameFrame>
  );
}
