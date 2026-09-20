import { useEffect, useRef, useState } from "react";
import { GameFrame, type MiniGameProps } from "./GameFrame";
import { GameButton, ProgressBar } from "@/components/game/ui";

type Thing = { id: number; lane: 0 | 1 | 2; y: number; kind: "flower" | "modak" | "decor" | "puddle" | "rock" | "hole" };

const GOODS = ["flower", "modak", "decor"] as const;
const BADS = ["puddle", "rock", "hole"] as const;
const GLYPH: Record<Thing["kind"], string> = {
  flower: "🌼",
  modak: "🥟",
  decor: "🎏",
  puddle: "💧",
  rock: "🪨",
  hole: "🕳️",
};

export function FestivalDelivery({ onExit, onFinish, difficulty = 3, extraTime = 0, hero = "🐭" }: MiniGameProps) {
  const duration = 38 + extraTime;
  const [things, setThings] = useState<Thing[]>([]);
  const [lane, setLane] = useState<0 | 1 | 2>(1);
  const [score, setScore] = useState(0);
  const [delivered, setDelivered] = useState(0);
  const [time, setTime] = useState(duration);
  const [flash, setFlash] = useState("Deliver flowers, modaks and decorations!");
  const laneRef = useRef(lane);
  const nextId = useRef(1);
  const done = useRef(false);
  laneRef.current = lane;

  const speed = 0.75 + difficulty * 0.18;

  useEffect(() => {
    const tick = setInterval(() => setTime((t) => t - 1), 1000);
    const spawn = setInterval(
      () => {
        setThings((prev) => {
          const bad = Math.random() < 0.38 + difficulty * 0.04;
          const kind = bad
            ? BADS[Math.floor(Math.random() * BADS.length)]!
            : GOODS[Math.floor(Math.random() * GOODS.length)]!;
          const l = Math.floor(Math.random() * 3) as 0 | 1 | 2;
          return [...prev.slice(-12), { id: nextId.current++, lane: l, y: -8, kind }];
        });
      },
      Math.max(420, 760 - difficulty * 60),
    );
    return () => {
      clearInterval(tick);
      clearInterval(spawn);
    };
  }, [difficulty]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setThings((prev) => {
        const kept: Thing[] = [];
        for (const t of prev) {
          const y = t.y + speed;
          if (y >= 78 && y < 92 && t.lane === laneRef.current) {
            const good = (GOODS as readonly string[]).includes(t.kind);
            if (good) {
              setScore((s) => s + 30);
              setDelivered((d) => d + 1);
              setFlash(`Delivered ${GLYPH[t.kind]} +30`);
            } else {
              setScore((s) => Math.max(0, s - 25));
              setFlash(`Oops, ${t.kind}! -25`);
            }
            continue;
          }
          if (y < 105) kept.push({ ...t, y });
        }
        return kept;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  useEffect(() => {
    if (time <= 0 && !done.current) {
      done.current = true;
      const speedBonus = Math.round(delivered * 6);
      const deliveryBonus = delivered >= 15 ? 80 : 0;
      onFinish(Math.max(0, score + speedBonus + deliveryBonus));
    }
  }, [time, score, delivered, onFinish]);

  return (
    <GameFrame
      title="Festival Delivery"
      hint={flash}
      score={score}
      onExit={onExit}
      meta={
        <div>
          <div className="mb-1 flex justify-between text-[0.7rem] text-muted-foreground">
            <span>Delivered {delivered}</span>
            <span>{Math.max(0, time)}s</span>
          </div>
          <ProgressBar value={Math.max(0, time) / duration} />
        </div>
      }
      footer={
        <div className="grid grid-cols-3 gap-2">
          <GameButton onClick={() => setLane(0)} variant={lane === 0 ? "primary" : "soft"} className="py-4">
            ◀ Left
          </GameButton>
          <GameButton onClick={() => setLane(1)} variant={lane === 1 ? "primary" : "soft"} className="py-4">
            Mid
          </GameButton>
          <GameButton onClick={() => setLane(2)} variant={lane === 2 ? "primary" : "soft"} className="py-4">
            Right ▶
          </GameButton>
        </div>
      }
    >
      <div className="surface relative grid h-[58dvh] grid-cols-3 gap-1 overflow-hidden rounded-3xl p-1">
        {[0, 1, 2].map((l) => (
          <div key={l} className="relative rounded-2xl bg-secondary/40">
            {things
              .filter((t) => t.lane === l)
              .map((t) => (
                <span key={t.id} className="absolute left-1/2 -translate-x-1/2 text-3xl" style={{ top: `${t.y}%` }}>
                  {GLYPH[t.kind]}
                </span>
              ))}
            {lane === l && (
              <span className="absolute left-1/2 top-[80%] -translate-x-1/2 text-4xl drop-shadow-[0_0_12px_var(--marigold)]">
                {hero}
              </span>
            )}
          </div>
        ))}
      </div>
    </GameFrame>
  );
}
