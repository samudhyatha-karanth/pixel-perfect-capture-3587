import { useEffect, useMemo, useRef, useState } from "react";
import { GameFrame, type MiniGameProps } from "./GameFrame";
import { ProgressBar } from "@/components/game/ui";

type Card = { id: number; face: string; flipped: boolean; matched: boolean };

const FACES = ["🥟", "🌼", "🎏", "🪔", "🔔", "🪷", "🥁", "🐭"];

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function MemoryChallenge({ onExit, onFinish, difficulty = 3, extraTime = 0 }: MiniGameProps) {
  const pairs = difficulty >= 4 ? 8 : difficulty >= 3 ? 6 : 4;
  const duration = 60 + extraTime;
  const initial = useMemo<Card[]>(
    () =>
      shuffle(FACES.slice(0, pairs).flatMap((f) => [f, f])).map((face, i) => ({
        id: i,
        face,
        flipped: false,
        matched: false,
      })),
    [pairs],
  );
  const [cards, setCards] = useState<Card[]>(initial);
  const [open, setOpen] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(duration);
  const [note, setNote] = useState(`Match all ${pairs} festival pairs`);
  const done = useRef(false);
  const matched = cards.filter((c) => c.matched).length / 2;

  useEffect(() => {
    const tick = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if ((time <= 0 || (matched === pairs && pairs > 0)) && !done.current) {
      done.current = true;
      const timeBonus = matched === pairs ? Math.max(0, time) * 6 : 0;
      onFinish(Math.max(0, score + timeBonus));
    }
  }, [time, matched, pairs, score, onFinish]);

  const flip = (card: Card) => {
    if (card.flipped || card.matched || open.length >= 2) return;
    const nextOpen = [...open, card.id];
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c)));
    setOpen(nextOpen);
    if (nextOpen.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nextOpen;
      const ca = cards.find((c) => c.id === a);
      const cb = cards.find((c) => c.id === b);
      const hit = ca && cb && ca.face === cb.face;
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === a || c.id === b ? { ...c, matched: !!hit, flipped: !!hit } : c,
          ),
        );
        setOpen([]);
      }, hit ? 220 : 620);
      if (hit) {
        setScore((s) => s + 90);
        setNote(`${ca!.face} pair matched! +90`);
      } else {
        setScore((s) => Math.max(0, s - 8));
        setNote("Not a pair — remember the spots.");
      }
    }
  };

  return (
    <GameFrame
      title="Memory Challenge"
      hint={note}
      score={score}
      onExit={onExit}
      meta={
        <div>
          <div className="mb-1 flex justify-between text-[0.7rem] text-muted-foreground">
            <span>
              Pairs {matched}/{pairs} · {moves} moves
            </span>
            <span>{Math.max(0, time)}s</span>
          </div>
          <ProgressBar value={Math.max(0, time) / duration} />
        </div>
      }
    >
      <div className={`grid gap-2 ${pairs >= 8 ? "grid-cols-4" : pairs >= 6 ? "grid-cols-4" : "grid-cols-3"}`}>
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => flip(c)}
            className={`grid aspect-square place-items-center rounded-2xl text-3xl transition active:scale-95 ${
              c.flipped || c.matched
                ? "bg-[image:var(--gradient-marigold)] text-primary-foreground"
                : "surface"
            } ${c.matched ? "opacity-60" : ""}`}
          >
            {c.flipped || c.matched ? c.face : "🪙"}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}
