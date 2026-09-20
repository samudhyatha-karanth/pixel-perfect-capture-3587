import { useState } from "react";
import { motion } from "motion/react";
import { Award, Boxes, Play, Settings as SettingsIcon, Shirt, Sparkles, Target, Trophy } from "lucide-react";
import {
  ACHIEVEMENTS,
  COSTUMES,
  DAILY_QUESTS,
  LEVELS,
  POWERUPS,
  TITLES,
  WEEKLY_QUESTS,
  costumeEmoji,
  levelFor,
  levelProgress,
  rankFor,
  totalStars,
  useGame,
} from "@/lib/game-state";
import { Petals, DiyaRow, Mushak } from "./effects";
import { GameButton, Panel, ProgressBar, StatPill } from "./ui";

type PanelId = "collection" | "achievements" | "leaderboard" | "settings" | "quests" | "locker" | null;

export function MainMenu({ onPlay }: { onPlay: () => void }) {
  const { state, toggleSetting, resetProgress, setCostume, setTitle, claimQuest } = useGame();
  const [panel, setPanel] = useState<PanelId>(null);
  const level = levelFor(state.totalBlessingPoints);
  const completion = state.completedLevels.length / LEVELS.length;
  const activeTitle = TITLES.find((t) => t.id === state.activeTitle)?.name ?? rankFor(state.totalBlessingPoints);

  const leaderboard = [
    { name: "Ananya", score: 1680 },
    { name: "Mushak", score: 1420 },
    { name: state.playerName || "You", score: state.totalBlessingPoints, you: true },
    { name: "Rohan", score: 980 },
    { name: "Meera", score: 720 },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="relative flex min-h-dvh flex-col rangoli-bg px-5 py-6">
      <Petals count={12} />
      <DiyaRow count={8} />

      <div className="relative z-10 mx-auto mt-4 flex w-full max-w-md flex-1 flex-col">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <h1 className="text-4xl font-extrabold text-festival">VighnaVerse</h1>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
            Where every obstacle becomes an adventure
          </p>
        </motion.div>

        <div className="surface mt-6 rounded-3xl p-4">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <Mushak mood={costumeEmoji(state)} />
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">{state.playerName || "Festival Explorer"}</p>
              <p className="truncate text-xs text-muted-foreground">Level {level} · {activeTitle}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <StatPill label="Points" value={state.totalBlessingPoints} emoji="✨" />
            <StatPill label="Coins" value={state.coins} emoji="🪙" />
            <StatPill label="Stars" value={totalStars(state)} emoji="⭐" />
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[0.7rem] text-muted-foreground">
              <span>Festival progress</span>
              <span>
                {state.completedLevels.length}/{LEVELS.length}
              </span>
            </div>
            <ProgressBar value={completion} />
            <div className="mt-2 flex justify-between text-[0.65rem] text-muted-foreground">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
            <ProgressBar value={levelProgress(state.totalBlessingPoints)} />
          </div>
        </div>

        <motion.div whileTap={{ scale: 0.97 }} className="mt-6">
          <GameButton variant="primary" className="py-5 text-xl" onClick={onPlay}>
            <Play className="size-5" /> PLAY
          </GameButton>
        </motion.div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <GameButton onClick={() => setPanel("quests")}>
            <Target className="size-4" /> Quests
          </GameButton>
          <GameButton onClick={() => setPanel("locker")}>
            <Shirt className="size-4" /> Mushak Locker
          </GameButton>
          <GameButton onClick={() => setPanel("collection")}>
            <Boxes className="size-4" /> Collection
          </GameButton>
          <GameButton onClick={() => setPanel("achievements")}>
            <Award className="size-4" /> Achievements
          </GameButton>
          <GameButton onClick={() => setPanel("leaderboard")}>
            <Trophy className="size-4" /> Leaderboard
          </GameButton>
          <GameButton onClick={() => setPanel("settings")}>
            <SettingsIcon className="size-4" /> Settings
          </GameButton>
        </div>

        <div className="surface mt-4 rounded-3xl p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Sparkles className="size-3.5" /> Power-ups ready
          </p>
          <div className="flex flex-wrap gap-2">
            {POWERUPS.map((p) => (
              <span key={p.id} className="rounded-full bg-secondary px-3 py-1 text-xs">
                {p.emoji} {state.powerUps[p.id] ?? 0}
              </span>
            ))}
          </div>
        </div>
      </div>

      {panel === "quests" && (
        <Panel title="Quests" onClose={() => setPanel(null)}>
          {(
            [
              ["daily", "Daily", DAILY_QUESTS],
              ["weekly", "Weekly", WEEKLY_QUESTS],
            ] as const
          ).map(([scope, label, pool]) => (
            <div key={scope} className="mb-4">
              <p className="mb-2 text-sm font-extrabold">{label}</p>
              <div className="space-y-2">
                {pool.map((q) => {
                  const bag = state[scope];
                  const done = (bag.progress[q.id] ?? 0) >= q.goal;
                  const claimed = bag.claimed.includes(q.id);
                  return (
                    <div key={q.id} className="surface rounded-2xl p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-semibold">{q.name}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">+{q.reward} 🪙</span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={Math.min(1, (bag.progress[q.id] ?? 0) / q.goal)} />
                      </div>
                      <button
                        disabled={!done || claimed}
                        onClick={() => claimQuest(scope, q.id)}
                        className="mt-2 w-full rounded-full bg-secondary px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                      >
                        {claimed ? "Claimed" : done ? "Claim reward" : `${bag.progress[q.id] ?? 0}/${q.goal}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Panel>
      )}

      {panel === "locker" && (
        <Panel title="Mushak Locker" onClose={() => setPanel(null)}>
          <p className="mb-2 text-sm font-extrabold">Costumes</p>
          <div className="grid grid-cols-2 gap-3">
            {COSTUMES.map((c) => {
              const owned = state.costumes.includes(c.id);
              return (
                <button
                  key={c.id}
                  disabled={!owned}
                  onClick={() => setCostume(c.id)}
                  className={`surface rounded-2xl p-3 text-center ${owned ? "" : "opacity-40 grayscale"} ${
                    state.activeCostume === c.id ? "border-primary" : ""
                  }`}
                >
                  <div className="text-3xl">{owned ? c.emoji : "❔"}</div>
                  <p className="mt-1 text-sm font-bold">{c.name}</p>
                  <p className="text-[0.65rem] text-muted-foreground">{owned ? "Tap to wear" : c.req}</p>
                </button>
              );
            })}
          </div>
          <p className="mb-2 mt-4 text-sm font-extrabold">Titles</p>
          <div className="space-y-2">
            {TITLES.map((t) => {
              const owned = state.titles.includes(t.id);
              return (
                <button
                  key={t.id}
                  disabled={!owned}
                  onClick={() => setTitle(t.id)}
                  className={`surface flex w-full items-center justify-between rounded-2xl px-3 py-2 ${
                    owned ? "" : "opacity-45"
                  } ${state.activeTitle === t.id ? "border-primary" : ""}`}
                >
                  <span className="truncate text-sm font-semibold">{t.name}</span>
                  <span className="shrink-0 text-[0.65rem] text-muted-foreground">{owned ? "Wear" : t.req}</span>
                </button>
              );
            })}
          </div>
        </Panel>
      )}

      {panel === "collection" && (
        <Panel title="Collection" onClose={() => setPanel(null)}>
          <div className="grid grid-cols-2 gap-3">
            {LEVELS.map((l) => {
              const owned = state.collection.includes(l.reward);
              return (
                <div key={l.num} className={`surface rounded-2xl p-4 text-center ${owned ? "" : "opacity-40 grayscale"}`}>
                  <div className="text-3xl">{owned ? l.rewardEmoji : "❔"}</div>
                  <p className="mt-2 text-sm font-bold">{owned ? l.reward : "Locked treasure"}</p>
                  <p className="text-[0.7rem] text-muted-foreground">{l.place}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {panel === "achievements" && (
        <Panel title="Achievements" onClose={() => setPanel(null)}>
          <div className="space-y-3">
            {ACHIEVEMENTS.map((a) => {
              const earned = state.achievements.includes(a.id);
              return (
                <div key={a.id} className={`surface flex items-center gap-3 rounded-2xl p-3 ${earned ? "" : "opacity-45"}`}>
                  <span className="shrink-0 text-2xl">{a.emoji}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{a.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {panel === "leaderboard" && (
        <Panel title="Leaderboard" onClose={() => setPanel(null)}>
          <div className="space-y-2">
            {leaderboard.map((row, i) => (
              <div
                key={row.name + i}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${row.you ? "bg-[image:var(--gradient-marigold)] text-primary-foreground" : "surface"}`}
              >
                <span className="w-6 shrink-0 text-center font-extrabold">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">{row.name}</span>
                <span className="shrink-0 font-bold">{row.score} ✨</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">Festival friends are practice scores saved on this device.</p>
        </Panel>
      )}

      {panel === "settings" && (
        <Panel title="Settings" onClose={() => setPanel(null)}>
          <div className="space-y-3">
            {(["sound", "effects"] as const).map((key) => (
              <button
                key={key}
                onClick={() => toggleSetting(key)}
                className="surface flex w-full items-center justify-between rounded-2xl px-4 py-3"
              >
                <span className="font-semibold capitalize">{key === "sound" ? "Sound cues" : "Visual effects"}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${state.settings[key] ? "bg-leaf text-ink" : "bg-secondary text-muted-foreground"}`}
                >
                  {state.settings[key] ? "ON" : "OFF"}
                </span>
              </button>
            ))}
            <GameButton
              onClick={() => {
                if (confirm("Reset all festival progress?")) {
                  resetProgress();
                  setPanel(null);
                }
              }}
              className="text-destructive"
            >
              Reset progress
            </GameButton>
          </div>
        </Panel>
      )}
    </div>
  );
}
