import { motion } from "motion/react";
import { useGame, levelFor } from "@/lib/game-state";
import { Petals, DiyaRow } from "./effects";
import { GameButton } from "./ui";

export function GrandCelebration({ onMenu }: { onMenu: () => void }) {
  const { state } = useGame();

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center rangoli-bg px-5 py-10 text-center">
      <Petals count={26} />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 110, damping: 12 }}
        className="relative z-10 w-full max-w-sm"
      >
        <DiyaRow count={9} />
        <div className="mt-6 text-6xl">🎆🐭🎆</div>
        <h1 className="mt-4 text-3xl font-extrabold text-festival">The Grand Celebration!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {state.playerName || "Festival Explorer"}, the pandal glows, the modaks are steaming and the dhol is thundering.
          Ganpati Bappa Morya!
        </p>

        <div className="surface mt-6 grid grid-cols-3 gap-2 rounded-3xl p-4 text-sm">
          <div>
            <p className="text-xl font-extrabold">{state.totalBlessingPoints}</p>
            <p className="text-[0.65rem] text-muted-foreground">Points</p>
          </div>
          <div>
            <p className="text-xl font-extrabold">{levelFor(state.totalBlessingPoints)}</p>
            <p className="text-[0.65rem] text-muted-foreground">Level</p>
          </div>
          <div>
            <p className="text-xl font-extrabold">{state.collection.length}</p>
            <p className="text-[0.65rem] text-muted-foreground">Treasures</p>
          </div>
        </div>

        <GameButton variant="primary" className="mt-6" onClick={onMenu}>
          BACK TO MAIN MENU
        </GameButton>
      </motion.div>
    </div>
  );
}
