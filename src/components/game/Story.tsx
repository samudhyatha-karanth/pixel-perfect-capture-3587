import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Petals, Mushak } from "./effects";
import { GameButton } from "./ui";

const LINES = [
  "The festival is almost here, but the celebration is not ready yet!",
  "Mushak needs your help.",
  "Collect flowers, prepare delicious modaks, decorate the pandal, keep the festival clean and master the celebration rhythm.",
  "Complete every challenge and unlock the Grand Celebration!",
];

export function Story({ onBegin }: { onBegin: () => void }) {
  const [step, setStep] = useState(0);
  const last = step >= LINES.length - 1;

  useEffect(() => {
    if (last) return;
    const t = setTimeout(() => setStep((s) => s + 1), 2600);
    return () => clearTimeout(t);
  }, [step, last]);

  return (
    <div className="relative flex min-h-dvh flex-col justify-between rangoli-bg px-5 py-8">
      <Petals count={10} />
      <div className="relative z-10 flex justify-end">
        <button onClick={onBegin} className="text-xs uppercase tracking-widest text-muted-foreground">
          Skip →
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <motion.div
          animate={{ x: [-14, 14, -14], rotate: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mushak className="size-20 text-4xl" />
        </motion.div>
        <div className="mt-8 min-h-28 max-w-sm">
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="text-lg font-semibold leading-relaxed"
            >
              “{LINES[step]}”
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="mt-4 flex gap-2">
          {LINES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-2 bg-secondary"}`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-sm">
        <GameButton variant="primary" onClick={onBegin}>
          BEGIN THE QUEST
        </GameButton>
      </div>
    </div>
  );
}
