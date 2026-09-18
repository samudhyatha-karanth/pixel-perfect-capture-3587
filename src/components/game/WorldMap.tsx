import { motion } from "motion/react";
import { ChevronLeft, Lock } from "lucide-react";
import { LOCATIONS, levelFor, useGame, type GameId } from "@/lib/game-state";
import { Petals, Mushak } from "./effects";
import { StatPill } from "./ui";

export function WorldMap({ onBack, onEnter }: { onBack: () => void; onEnter: (id: GameId) => void }) {
  const { state } = useGame();

  return (
    <div className="relative min-h-dvh rangoli-bg px-5 py-6">
      <Petals count={8} />
      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <button onClick={onBack} className="surface grid size-10 shrink-0 place-items-center rounded-full">
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold text-festival">Festival World</h1>
            <p className="truncate text-xs text-muted-foreground">
              Level {levelFor(state.totalBlessingPoints)} · {state.completedGames.length}/5 challenges done
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <StatPill label="Blessing Points" value={state.totalBlessingPoints} emoji="✨" />
          <StatPill label="Treasures" value={state.collection.length} emoji="🧺" />
        </div>

        <div className="surface mt-4 flex items-center gap-3 rounded-3xl p-3">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
            <Mushak />
          </motion.div>
          <p className="min-w-0 text-sm text-muted-foreground">
            {state.completedGames.length === 5
              ? "Everything is ready — the Grand Celebration awaits at the stage!"
              : "Squeak! Finish a place to unlock the next one on the street."}
          </p>
        </div>

        <div className="mt-5 space-y-4 pb-10">
          {LOCATIONS.map((loc, i) => {
            const unlocked = state.unlockedLocations.includes(loc.id);
            const done = state.completedGames.includes(loc.id);
            const best = state.highScores[loc.id] ?? 0;
            return (
              <motion.button
                key={loc.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                disabled={!unlocked}
                onClick={() => onEnter(loc.id)}
                className={`surface relative w-full overflow-hidden rounded-3xl p-4 text-left ${
                  unlocked ? "border-primary/40" : "opacity-60"
                }`}
              >
                <div className="absolute -right-6 -top-6 size-24 rounded-full bg-[image:var(--gradient-marigold)] opacity-20 blur-xl" />
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-2xl">
                    {loc.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-extrabold">{loc.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{loc.game}</p>
                  </div>
                  {done ? (
                    <span className="shrink-0 rounded-full bg-leaf px-2 py-1 text-[0.65rem] font-bold text-ink">DONE</span>
                  ) : unlocked ? (
                    <span className="shrink-0 rounded-full bg-[image:var(--gradient-marigold)] px-2 py-1 text-[0.65rem] font-bold text-primary-foreground">
                      PLAY
                    </span>
                  ) : (
                    <Lock className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {unlocked ? loc.blurb : "🔒 LOCKED — Complete the previous challenge to unlock."}
                </p>
                {unlocked && best > 0 && (
                  <p className="mt-1 text-[0.7rem] font-semibold text-primary">Best score {best} ✨</p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
