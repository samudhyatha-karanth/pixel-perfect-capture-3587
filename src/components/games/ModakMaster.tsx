import { useEffect, useRef, useState } from "react";
import { GameFrame, type MiniGameProps } from "./GameFrame";
import { GameButton } from "@/components/game/ui";

const ROUNDS = 8;

export function ModakMaster({ onExit, onFinish }: MiniGameProps) {
  const [pos, setPos] = useState(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Tap when the steam hits the golden zone");
  const [locked, setLocked] = useState(false);
  const dir = useRef(1);
  const speed = useRef(0.9);
  const zone = useRef({ start: 40, width: 22 });

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setPos((p) => {
        let next = p + dir.current * speed.current;
        if (next > 100) {
          next = 100;
          dir.current = -1;
        }
        if (next < 0) {
          next = 0;
          dir.current = 1;
        }
        return next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const tap = () => {
    if (locked) return;
    const { start, width } = zone.current;
    const center = start + width / 2;
    const inside = pos >= start && pos <= start + width;
    const perfect = Math.abs(pos - center) < width * 0.18;
    const gained = perfect ? 60 : inside ? 35 : 0;
    setScore((s) => s + gained);
    setMessage(perfect ? "Perfect modak! 🥟✨" : inside ? "Tasty modak 🥟" : "Burnt this one 😅");
    setLocked(true);

    setTimeout(() => {
      if (round >= ROUNDS) {
        onFinish(score + gained);
        return;
      }
      setRound((r) => r + 1);
      speed.current = Math.min(2.2, speed.current + 0.18);
      const width2 = Math.max(12, 22 - round * 1.2);
      zone.current = { start: 10 + Math.random() * (80 - width2), width: width2 };
      setLocked(false);
    }, 650);
  };

  const { start, width } = zone.current;

  return (
    <GameFrame
      title="Modak Master"
      hint={`Round ${round} of ${ROUNDS}`}
      score={score}
      onExit={onExit}
      footer={
        <GameButton variant="primary" onClick={tap} disabled={locked} className="py-5 text-lg">
          STEAM IT! 🍬
        </GameButton>
      }
    >
      <div className="surface flex h-[58dvh] flex-col items-center justify-center gap-8 rounded-3xl p-6 text-center">
        <div className="text-6xl">🥟</div>
        <p className="text-sm font-semibold text-muted-foreground">{message}</p>
        <div className="relative h-7 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="absolute inset-y-0 rounded-full bg-[image:var(--gradient-gold)]"
            style={{ left: `${start}%`, width: `${width}%` }}
          />
          <div
            className="absolute inset-y-0 w-1.5 -translate-x-1/2 rounded-full bg-magenta"
            style={{ left: `${pos}%` }}
          />
        </div>
      </div>
    </GameFrame>
  );
}
