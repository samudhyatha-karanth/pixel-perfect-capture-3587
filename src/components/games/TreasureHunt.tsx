import { useEffect, useMemo, useRef, useState } from "react";
import { GameFrame, type MiniGameProps } from "./GameFrame";
import { ProgressBar } from "@/components/game/ui";

type Spot = { id: number; cover: string; content: "target" | "bonus" | "empty"; found: boolean };

const TREASURES = [
  { name: "Golden Modak", emoji: "🥟", clue: "Sweet and round, hidden where the kitchen smoke curls." },
  { name: "Festival Bell", emoji: "🔔", clue: "It rings for Bappa at the temple door." },
  { name: "Lotus Flower", emoji: "🪷", clue: "It floats where the village pond is calm." },
  { name: "Sacred Lamp", emoji: "🪔", clue: "A small flame that never sleeps at night." },
];

const COVERS = ["🏠", "🌳", "🛖", "🪵", "🧺", "🪴", "🛕", "🚪", "🪟", "🧱", "🐄", "🚲"];

function buildBoard(round: number) {
  const size = 12;
  const targetIdx = Math.floor(Math.random() * size);
  let bonusIdx = Math.floor(Math.random() * size);
  if (bonusIdx === targetIdx) bonusIdx = (bonusIdx + 3) % size;
  return Array.from({ length: size }, (_, i) => ({
    id: round * 100 + i,
    cover: COVERS[i % COVERS.length]!,
    content: i === targetIdx ? ("target" as const) : i === bonusIdx ? ("bonus" as const) : ("empty" as const),
    found: false,
  }));
}

export function TreasureHunt({ onExit, onFinish, difficulty = 3, extraTime = 0 }: MiniGameProps) {
  const duration = 45 + extraTime - difficulty * 2;
  const [round, setRound] = useState(0);
  const [spots, setSpots] = useState<Spot[]>(() => buildBoard(0));
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(duration);
  const [note, setNote] = useState("Read the clue, then search the village.");
  const done = useRef(false);

  const treasure = useMemo(() => TREASURES[round % TREASURES.length]!, [round]);

  useEffect(() => {
    const tick = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if ((time <= 0 || round >= 4) && !done.current) {
      done.current = true;
      onFinish(Math.max(0, score + Math.max(0, time) * 4));
    }
  }, [time, round, score, onFinish]);

  const dig = (spot: Spot) => {
    if (spot.found) return;
    setSpots((prev) => prev.map((s) => (s.id === spot.id ? { ...s, found: true } : s)));
    if (spot.content === "target") {
      setScore((s) => s + 120);
      setNote(`Found the ${treasure.name}! +120`);
      setTimeout(() => {
        setRound((r) => {
          const nr = r + 1;
          setSpots(buildBoard(nr));
          return nr;
        });
        setNote("New clue — keep hunting!");
      }, 700);
    } else if (spot.content === "bonus") {
      setScore((s) => s + 45);
      setNote("Hidden bonus area! +45 ✨");
    } else {
      setScore((s) => Math.max(0, s - 10));
      setNote("Nothing here… -10");
    }
  };

  return (
    <GameFrame
      title="Treasure Hunt"
      hint={note}
      score={score}
      onExit={onExit}
      meta={
        <div>
          <div className="surface mb-2 rounded-2xl px-3 py-2 text-xs">
            <span className="font-bold text-primary">Clue {round + 1}/4:</span> {treasure.emoji} {treasure.clue}
          </div>
          <div className="mb-1 flex justify-between text-[0.7rem] text-muted-foreground">
            <span>Treasures {round}/4</span>
            <span>{Math.max(0, time)}s</span>
          </div>
          <ProgressBar value={Math.max(0, time) / duration} />
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        {spots.map((s) => (
          <button
            key={s.id}
            onClick={() => dig(s)}
            className={`surface grid aspect-square place-items-center rounded-2xl text-3xl transition active:scale-95 ${
              s.found ? "opacity-70" : ""
            }`}
          >
            {s.found ? (s.content === "target" ? treasure.emoji : s.content === "bonus" ? "✨" : "🕸️") : s.cover}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}
