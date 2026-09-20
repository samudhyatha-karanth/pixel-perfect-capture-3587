import { useEffect, useRef, useState } from "react";
import { GameFrame, type MiniGameProps } from "./GameFrame";
import { GameButton, ProgressBar } from "@/components/game/ui";

type Obj = { id: number; x: number; kind: "rock" | "water" | "clutter" | "coin" | "power" };

const GLYPH: Record<Obj["kind"], string> = {
  rock: "🪨",
  water: "🌊",
  clutter: "🎪",
  coin: "🪙",
  power: "⭐",
};

export function ObstacleRun({ onExit, onFinish, difficulty = 4, extraTime = 0, hero = "🐭" }: MiniGameProps) {
  const duration = 42 + extraTime;
  const [objs, setObjs] = useState<Obj[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(duration);
  const [jumping, setJumping] = useState(false);
  const [note, setNote] = useState("Tap JUMP over rocks, water and clutter");
  const jumpRef = useRef(false);
  const nextId = useRef(1);
  const done = useRef(false);
  const speed = 0.9 + difficulty * 0.22;

  useEffect(() => {
    const tick = setInterval(() => setTime((t) => t - 1), 1000);
    const spawn = setInterval(
      () => {
        setObjs((prev) => {
          const roll = Math.random();
          const kind: Obj["kind"] =
            roll > 0.78 ? "coin" : roll > 0.72 ? "power" : roll > 0.48 ? "rock" : roll > 0.24 ? "water" : "clutter";
          return [...prev.slice(-10), { id: nextId.current++, x: 104, kind }];
        });
      },
      Math.max(650, 1100 - difficulty * 90),
    );
    return () => {
      clearInterval(tick);
      clearInterval(spawn);
    };
  }, [difficulty]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setObjs((prev) => {
        const kept: Obj[] = [];
        for (const o of prev) {
          const x = o.x - speed;
          if (x <= 20 && x > 8) {
            if (o.kind === "coin") {
              setScore((s) => s + 25);
              setNote("Coin! +25 🪙");
              continue;
            }
            if (o.kind === "power") {
              setScore((s) => s + 60);
              setNote("Power-up blessing! +60 ⭐");
              continue;
            }
            if (!jumpRef.current) {
              setLives((l) => l - 1);
              setScore((s) => Math.max(0, s - 20));
              setNote(`Ouch — ${o.kind}! Life lost`);
              continue;
            }
            setScore((s) => s + 35);
            setNote("Clean jump! +35");
            continue;
          }
          if (x > -10) kept.push({ ...o, x });
        }
        return kept;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  useEffect(() => {
    if ((time <= 0 || lives <= 0) && !done.current) {
      done.current = true;
      onFinish(Math.max(0, score + lives * 40));
    }
  }, [time, lives, score, onFinish]);

  const jump = () => {
    if (jumpRef.current) return;
    jumpRef.current = true;
    setJumping(true);
    setTimeout(() => {
      jumpRef.current = false;
      setJumping(false);
    }, 620);
  };

  return (
    <GameFrame
      title="Mushak Obstacle Run"
      hint={note}
      score={score}
      onExit={onExit}
      meta={
        <div>
          <div className="mb-1 flex justify-between text-[0.7rem] text-muted-foreground">
            <span>{"❤️".repeat(Math.max(0, lives))}</span>
            <span>{Math.max(0, time)}s</span>
          </div>
          <ProgressBar value={Math.max(0, time) / duration} />
        </div>
      }
      footer={
        <GameButton variant="primary" onClick={jump} className="py-6 text-xl">
          JUMP 🦘
        </GameButton>
      }
    >
      <div className="surface relative h-[52dvh] w-full overflow-hidden rounded-3xl">
        <div className="absolute inset-x-0 bottom-10 h-1 bg-gold/50" />
        {objs.map((o) => (
          <span key={o.id} className="absolute bottom-10 text-3xl" style={{ left: `${o.x}%` }}>
            {GLYPH[o.kind]}
          </span>
        ))}
        <span
          className="absolute left-[14%] text-4xl transition-all duration-300 drop-shadow-[0_0_12px_var(--marigold)]"
          style={{ bottom: jumping ? "26%" : "2.5rem" }}
        >
          {hero}
        </span>
      </div>
    </GameFrame>
  );
}
