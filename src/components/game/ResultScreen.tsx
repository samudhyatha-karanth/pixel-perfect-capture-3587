import { motion } from "motion/react";
import type { FinishResult, SurpriseEvent } from "@/lib/game-state";
import { Petals } from "./effects";
import { GameButton } from "./ui";

export function ResultScreen({
  result,
  event,
  onReplay,
  onMap,
  onCelebrate,
}: {
  result: FinishResult;
  event: SurpriseEvent | null;
  onReplay: () => void;
  onMap: () => void;
  onCelebrate: () => void;
}) {
  const notes: string[] = [];
  if (result.reward) notes.push(`${result.reward.rewardEmoji} Added ${result.reward.reward} to your collection`);
  if (result.unlockedLevel) notes.push(`🔓 Unlocked Level ${result.unlockedLevel.num} — ${result.unlockedLevel.name}`);
  if (result.powerUpWon) notes.push(`${result.powerUpWon.emoji} Power-up won: ${result.powerUpWon.name}`);
  for (const t of result.newTitles) notes.push(`🏷️ New title: ${t.name}`);
  for (const c of result.newCostumes) notes.push(`${c.emoji} New costume: ${c.name}`);
  for (const a of result.newAchievements) notes.push(`${a.emoji} Achievement: ${a.name}`);
  for (const q of result.questsCompleted) notes.push(`✅ Quest complete: ${q}`);

  return (
    <div className="relative flex min-h-dvh items-center justify-center rangoli-bg px-5 py-8">
      <Petals count={16} />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="surface relative z-10 w-full max-w-sm rounded-3xl p-6 text-center"
      >
        <div className="text-5xl">{result.level.emoji}</div>
        <h1 className="mt-3 text-2xl font-extrabold text-festival">
          {result.passed ? `${result.level.name} complete!` : "So close!"}
        </h1>
        <p className="mt-1 text-2xl tracking-widest">{"⭐".repeat(result.stars) || "☆☆☆"}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.best ? "New personal best!" : result.passed ? "Well played, helper!" : "Try again to earn a star."}
        </p>
        {event && (
          <p className="mt-2 rounded-2xl bg-secondary px-3 py-2 text-xs">
            {event.emoji} {event.name} — {event.note}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-[image:var(--gradient-marigold)] px-4 py-4 text-primary-foreground">
            <p className="text-[0.6rem] uppercase tracking-widest">Points</p>
            <p className="text-3xl font-extrabold">+{result.points}</p>
          </div>
          <div className="rounded-2xl bg-secondary px-4 py-4">
            <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">Coins</p>
            <p className="text-3xl font-extrabold">+{result.coins}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          {notes.map((n) => (
            <p key={n} className="rounded-2xl bg-secondary px-3 py-2">
              {n}
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
