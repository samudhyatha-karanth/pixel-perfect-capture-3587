import { useEffect, useRef, useState } from "react";
import { GameFrame, type MiniGameProps } from "./GameFrame";
import { GameButton, ProgressBar } from "@/components/game/ui";

type Bin = "natural" | "reuse";
type Trash = { emoji: string; label: string; bin: Bin };

const TRASH: Trash[] = [
  { emoji: "🌼", label: "Wilted flowers", bin: "natural" },
  { emoji: "🍌", label: "Banana leaf plate", bin: "natural" },
  { emoji: "🥤", label: "Plastic cup", bin: "reuse" },
  { emoji: "🧴", label: "Oil bottle", bin: "reuse" },
  { emoji: "🌿", label: "Mango leaves", bin: "natural" },
  { emoji: "📦", label: "Cardboard box", bin: "reuse" },
  { emoji: "🥥", label: "Coconut shell", bin: "natural" },
  { emoji: "🔋", label: "Old battery", bin: "reuse" },
];

const DURATION = 35;

export function EcoChallenge({ onExit, onFinish }: MiniGameProps) {
  const [item, setItem] = useState<Trash>(TRASH[0]!);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const done = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setTime((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (time <= 0 && !done.current) {
      done.current = true;
      onFinish(Math.max(0, score));
    }
  }, [time, score, onFinish]);

  const choose = (bin: Bin) => {
    const correct = bin === item.bin;
    setFlash(correct ? "good" : "bad");
    setStreak((s) => (correct ? s + 1 : 0));
    setScore((s) => Math.max(0, s + (correct ? 25 + streak * 5 : -10)));
    setTimeout(() => setFlash(null), 250);
    setItem(TRASH[Math.floor(Math.random() * TRASH.length)]!);
  };

  return (
    <GameFrame
      title="Eco Challenge"
      hint="Sort every festival leftover into the right bin"
      score={score}
      onExit={onExit}
      meta={
        <div>
          <div className="mb-1 flex justify-between text-[0.7rem] text-muted-foreground">
            <span>Streak x{streak}</span>
            <span>{Math.max(0, time)}s</span>
          </div>
          <ProgressBar value={Math.max(0, time) / DURATION} />
        </div>
      }
      footer={
        <div className="grid grid-cols-2 gap-3">
          <GameButton variant="primary" onClick={() => choose("natural")}>
            🌿 Compost
          </GameButton>
          <GameButton variant="primary" onClick={() => choose("reuse")}>
            ♻️ Recycle
          </GameButton>
        </div>
      }
    >
      <div
        className={`surface flex h-[52dvh] flex-col items-center justify-center gap-4 rounded-3xl transition-colors ${
          flash === "good" ? "border-leaf" : flash === "bad" ? "border-destructive" : ""
        }`}
      >
        <div className="text-7xl">{item.emoji}</div>
        <p className="text-lg font-extrabold">{item.label}</p>
        <p className="text-xs text-muted-foreground">Keep the river and the street clean</p>
      </div>
    </GameFrame>
  );
}
