import { useState } from "react";
import { motion } from "motion/react";
import { Petals } from "./effects";
import { GameButton } from "./ui";

export function Onboarding({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <div className="relative flex min-h-dvh items-center justify-center rangoli-bg px-5">
      <Petals count={10} />
      <motion.form
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(name);
        }}
        className="surface relative z-10 w-full max-w-sm rounded-3xl p-6 text-center"
      >
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[image:var(--gradient-marigold)] text-3xl glow-ring">
          🪔
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-festival">Welcome, Festival Explorer!</h1>
        <p className="mt-2 text-sm text-muted-foreground">Mushak is waiting to meet you.</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={18}
          placeholder="Enter your nickname"
          className="mt-5 w-full rounded-2xl border border-border bg-input/60 px-4 py-3 text-center text-base outline-none focus:border-primary"
        />
        <GameButton type="submit" variant="primary" className="mt-4">
          START ADVENTURE
        </GameButton>
      </motion.form>
    </div>
  );
}
