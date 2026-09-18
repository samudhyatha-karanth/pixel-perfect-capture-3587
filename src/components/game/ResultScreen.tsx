import { motion } from "motion/react";
import type { FinishResult, LocationInfo } from "@/lib/game-state";
import { Petals } from "./effects";
import { GameButton } from "./ui";

export function ResultScreen({
  location,
  result,
  onReplay,
  onMap,
  onCelebrate,
}: {
  location: LocationInfo;
  result: FinishResult;
  onReplay: () => void;
  onMap: () => void;
  onCelebrate: () => void;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center rangoli-bg px-5 py-8">
      <Petals count={16} />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="surface relative z-10 w-full max-w-sm rounded-3xl p-6 text-center"
      >
        <div className="text-5xl">{location.emoji}</div>
        <h1 className="mt-3 text-2xl font-extrabold text-festival">{location.game} complete!</h1>
        <p className="mt-1 text-sm text-muted-foreground">{result.best ? "New personal best!" : "Well played, helper!"}</p>

        <div className="mt-5 rounded-2xl bg-[image:var(--gradient-marigold)] px-4 py-5 text-primary-foreground">
          <p className="text-xs uppercase tracking-widest">Blessing points earned</p>
          <p className="text-4xl font-extrabold">+{result.points}</p>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          {result.reward && (
            <p className="rounded-2xl bg-secondary px-3 py-2">
              {result.reward.rewardEmoji} Added <strong>{result.reward.reward}</strong> to your collection
            </p>
          )}
          {result.unlocked && (
            <p className="rounded-2xl bg-secondary px-3 py-2">
              🔓 Unlocked <strong>{result.unlocked.name}</strong>
            </p>
          )}
          {result.newAchievements.map((a) => (
            <p key={a.id} className="rounded-2xl bg-secondary px-3 py-2">
              {a.emoji} Achievement: <strong>{a.name}</strong>
            </p>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          {result.allDone ? (
            <GameButton variant="primary" onClick={onCelebrate}>
              ENTER GRAND CELEBRATION 🎆
            </GameButton>
          ) : (
            <GameButton variant="primary" onClick={onMap}>
              BACK TO FESTIVAL WORLD
            </GameButton>
          )}
          <GameButton onClick={onReplay}>Play again</GameButton>
        </div>
      </motion.div>
    </div>
  );
}
