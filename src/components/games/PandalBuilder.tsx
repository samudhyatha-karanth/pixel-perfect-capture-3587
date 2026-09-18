import { useEffect, useRef, useState } from "react";
import { GameFrame, type MiniGameProps } from "./GameFrame";
import { GameButton } from "@/components/game/ui";

type Block = { left: number; width: number; emoji: string };

const DECOR = ["🎪", "🎋", "🏵️", "🪔", "🎊", "🌸", "🔔", "🪷"];
const START_WIDTH = 62;

export function PandalBuilder({ onExit, onFinish }: MiniGameProps) {
  const [stack, setStack] = useState<Block[]>([{ left: 19, width: START_WIDTH, emoji: "🛕" }]);
  const [score, setScore] = useState(0);
  const [moverLeft, setMoverLeft] = useState(0);
  const [message, setMessage] = useState("Tap DROP to stack the decoration");
  const dir = useRef(1);
  const speed = useRef(0.85);
  const finished = useRef(false);

  const top = stack[stack.length - 1]!;

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setMoverLeft((p) => {
        let next = p + dir.current * speed.current;
        const max = 100 - top.width;
        if (next > max) {
          next = max;
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
  }, [top.width]);

  const drop = () => {
    if (finished.current) return;
    const overlapLeft = Math.max(moverLeft, top.left);
    const overlapRight = Math.min(moverLeft + top.width, top.left + top.width);
    const overlap = overlapRight - overlapLeft;

    if (overlap <= 6) {
      finished.current = true;
      setMessage("The pandal wobbled over! 😵");
      setTimeout(() => onFinish(score), 700);
      return;
    }

    const precise = overlap > top.width - 3;
    const gained = precise ? 70 : 30;
    setScore((s) => s + gained);
    setMessage(precise ? "Perfectly aligned! ✨" : "Nice stack!");
    setStack((s) => [
      ...s,
      { left: overlapLeft, width: overlap, emoji: DECOR[s.length % DECOR.length] ?? "🏵️" },
    ]);
    speed.current = Math.min(2.4, speed.current + 0.12);

    if (stack.length >= 8) {
      finished.current = true;
      setMessage("The pandal is complete! 🎉");
      setTimeout(() => onFinish(score + gained + 50), 800);
    }
  };

  return (
    <GameFrame
      title="Pandal Builder"
      hint={`Layer ${stack.length} of 9 · ${message}`}
      score={score}
      onExit={onExit}
      footer={
        <GameButton variant="primary" onClick={drop} className="py-5 text-lg">
          DROP 🎪
        </GameButton>
      }
    >
      <div className="surface relative flex h-[58dvh] flex-col justify-end overflow-hidden rounded-3xl p-3">
        {!finished.current && (
          <div
            className="absolute top-4 h-9 rounded-xl bg-[image:var(--gradient-marigold)] text-center text-lg leading-9 glow-ring"
            style={{ left: `${moverLeft}%`, width: `${top.width}%` }}
          >
            {DECOR[stack.length % DECOR.length]}
          </div>
        )}
        <div className="flex flex-col-reverse gap-1">
          {stack.map((b, i) => (
            <div
              key={i}
              className="relative h-9 rounded-xl bg-secondary text-center text-lg leading-9"
              style={{ marginLeft: `${b.left}%`, width: `${b.width}%` }}
            >
              {b.emoji}
            </div>
          ))}
        </div>
      </div>
    </GameFrame>
  );
}
