import { useState } from "react";
import { motion } from "motion/react";
import { Award, Boxes, Play, Settings as SettingsIcon, Trophy } from "lucide-react";
import { ACHIEVEMENTS, GAME_ORDER, LOCATIONS, levelFor, levelProgress, useGame } from "@/lib/game-state";
import { Petals, DiyaRow, Mushak } from "./effects";
import { GameButton, Panel, ProgressBar, StatPill } from "./ui";

type PanelId = "collection" | "achievements" | "leaderboard" | "settings" | null;

export function MainMenu({ onPlay }: { onPlay: () => void }) {
  const { state, toggleSetting, resetProgress } = useGame();
  const [panel, setPanel] = useState<PanelId>(null);
  const level = levelFor(state.totalBlessingPoints);
  const completion = state.completedGames.length / GAME_ORDER.length;

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
            <Mushak />
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">{state.playerName || "Festival Explorer"}</p>
              <p className="text-xs text-muted-foreground">Level {level} · Mushak's helper</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <StatPill label="Blessing Points" value={state.totalBlessingPoints} emoji="✨" />
            <StatPill label="Challenges" value={`${state.completedGames.length}/5`} emoji="🎯" />
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[0.7rem] text-muted-foreground">
              <span>Festival progress</span>
              <span>{Math.round(completion * 100)}%</span>
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
      </div>

      {panel === "collection" && (
        <Panel title="Collection" onClose={() => setPanel(null)}>
          <div className="grid grid-cols-2 gap-3">
            {LOCATIONS.map((l) => {
              const owned = state.collection.includes(l.reward);
              return (
                <div
                  key={l.id}
                  className={`surface rounded-2xl p-4 text-center ${owned ? "" : "opacity-40 grayscale"}`}
                >
                  <div className="text-3xl">{owned ? l.rewardEmoji : "❔"}</div>
                  <p className="mt-2 text-sm font-bold">{owned ? l.reward : "Locked treasure"}</p>
                  <p className="text-[0.7rem] text-muted-foreground">{l.name}</p>
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
