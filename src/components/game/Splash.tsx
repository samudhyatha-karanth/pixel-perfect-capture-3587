import { useEffect } from "react";
import { motion } from "motion/react";
import { Petals, DiyaRow } from "./effects";

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center rangoli-bg px-6 text-center" onClick={onDone}>
      <Petals count={18} />
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="relative z-10"
      >
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-[image:var(--gradient-marigold)] text-5xl glow-ring">
          🐭
        </div>
        <h1 className="mt-6 text-5xl font-extrabold text-festival">VighnaVerse</h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-3 text-sm tracking-[0.18em] text-muted-foreground uppercase"
        >
          Where every obstacle becomes an adventure
        </motion.p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 w-full max-w-sm"
      >
        <DiyaRow />
        <p className="mt-3 text-xs text-muted-foreground">Tap to continue</p>
      </motion.div>
    </div>
  );
}
