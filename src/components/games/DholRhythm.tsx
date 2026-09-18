import { useEffect, useRef, useState } from "react";
import { GameFrame, type MiniGameProps } from "./GameFrame";
import { GameButton, ProgressBar } from "@/components/game/ui";

type Beat = { id: number; y: number; lane: 0 | 1 };

const DURATION = 35;
const HIT_LINE = 82;

export function DholRhythm({ onExit, onFinish }: MiniGameProps) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [combo, setCombo] = useState(0);
  const [judge, setJudge] = useState("Tap the lane when the beat reaches the line");
  const nextId = useRef(1);
  const done = useRef(false);

  useEffect(() => {
    const tick = setInterval(() => setTime((t) => t - 1), 1000);
    const spawn = setInterval(() => {
      setBeats((b) => [...b.slice(-10), { id: nextId.current++, y: -6, lane: Math.random() > 0.5 ? 1 : 0 }]);
    }, 750);
    return () => {
      clearInterval(tick);
      clearInterval(spawn);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setBeats((prev) => {
        const kept = prev.map((b) => ({ ...b, y: b.y + 0.85 }));
        const missed = kept.filter((b) => b.y >= 100);
        if (missed.length) setCombo(0);
        return kept.filter((b) => b.y < 100);
      });
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

  const hit = (lane: 0 | 1) => {
    setBeats((prev) => {
      let bestIdx = -1;
      let bestDist = Infinity;
      prev.forEach((b, i) => {
        if (b.lane !== lane) return;
        const d = Math.abs(b.y - HIT_LINE);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      });
      if (bestIdx === -1 || bestDist > 14) {
        setCombo(0);
        setJudge("Missed the beat 😬");
        return prev;
      }
      const perfect = bestDist < 5;
      setCombo((c) => c + 1);
      setScore((s) => s + (perfect ? 40 : 20) + combo * 2);
      setJudge(perfect ? "DHAM! Perfect 🔥" : "Good beat 👏");
      return prev.filter((_, i) => i !== bestIdx);
    });
  };

  return (
    <GameFrame
      title="Dhol Rhythm"
      hint={judge}
      score={score}
      onExit={onExit}
      meta={
        <div>
          <div className="mb-1 flex justify-between text-[0.7rem] text-muted-foreground">
            <span>Combo x{combo}</span>
            <span>{Math.max(0, time)}s</span>
          </div>
          <ProgressBar value={Math.max(0, time) / DURATION} />
        </div>
      }
      footer={
        <div className="grid grid-cols-2 gap-3">
          <GameButton variant="primary" onClick={() => hit(0)} className="py-5 text-lg">
            🪘 LEFT
          </GameButton>
          <GameButton variant="primary" onClick={() => hit(1)} className="py-5 text-lg">
            RIGHT 🥁
          </GameButton>
        </div>
      }
    >
      <div className="surface relative grid h-[52dvh] grid-cols-2 gap-2 overflow-hidden rounded-3xl p-2">
        <div
          className="pointer-events-none absolute inset-x-0 h-0.5 bg-gold/70"
          style={{ top: `${HIT_LINE}%` }}
        />
        {[0, 1].map((lane) => (
          <div key={lane} className="relative rounded-2xl bg-secondary/50">
            {beats
              .filter((b) => b.lane === lane)
              .map((b) => (
                <span
                  key={b.id}
                  className="absolute left-1/2 -translate-x-1/2 text-3xl"
                  style={{ top: `${b.y}%` }}
                >
                  {lane === 0 ? "🪘" : "🥁"}
                </span>
              ))}
          </div>
        ))}
      </div>
    </GameFrame>
  );
}
