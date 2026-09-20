import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  GameProvider,
  costumeEmoji,
  levelInfo,
  modifiersFor,
  randomEvent,
  useGame,
  type FinishResult,
  type GameKind,
  type SurpriseEvent,
} from "@/lib/game-state";
import { Splash } from "@/components/game/Splash";
import { Onboarding } from "@/components/game/Onboarding";
import { Story } from "@/components/game/Story";
import { MainMenu } from "@/components/game/MainMenu";
import { WorldMap } from "@/components/game/WorldMap";
import { ResultScreen } from "@/components/game/ResultScreen";
import { GrandCelebration } from "@/components/game/GrandCelebration";
import { FlowerRush } from "@/components/games/FlowerRush";
import { ModakMaster } from "@/components/games/ModakMaster";
import { PandalBuilder } from "@/components/games/PandalBuilder";
import { EcoChallenge } from "@/components/games/EcoChallenge";
import { DholRhythm } from "@/components/games/DholRhythm";
import { FestivalDelivery } from "@/components/games/FestivalDelivery";
import { TreasureHunt } from "@/components/games/TreasureHunt";
import { MemoryChallenge } from "@/components/games/MemoryChallenge";
import { ObstacleRun } from "@/components/games/ObstacleRun";
import type { MiniGameProps } from "@/components/games/GameFrame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VighnaVerse — Where Every Obstacle Becomes an Adventure" },
      {
        name: "description",
        content:
          "Help Mushak prepare a grand Ganesh Chaturthi celebration in VighnaVerse: ten levels across four worlds, boss challenges, power-ups, quests and a champion finale.",
      },
      { property: "og:title", content: "VighnaVerse — Festival Adventure Game" },
      {
        property: "og:description",
        content: "Catch marigolds, steam modaks, build the pandal, hunt treasures and become the Festival Champion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <GameProvider>
      <VighnaVerse />
    </GameProvider>
  ),
});

type Screen = "splash" | "name" | "story" | "menu" | "map" | "play" | "result" | "grand";

const GAME_COMPONENTS: Record<GameKind, (p: MiniGameProps) => React.JSX.Element> = {
  flower: FlowerRush,
  modak: ModakMaster,
  pandal: PandalBuilder,
  eco: EcoChallenge,
  dhol: DholRhythm,
  delivery: FestivalDelivery,
  treasure: TreasureHunt,
  memory: MemoryChallenge,
  obstacle: ObstacleRun,
  champion: ObstacleRun,
};

function VighnaVerse() {
  const { state, ready, setPlayerName, markStorySeen, finishLevel } = useGame();
  const [screen, setScreen] = useState<Screen>("splash");
  const [activeLevel, setActiveLevel] = useState(1);
  const [event, setEvent] = useState<SurpriseEvent | null>(null);
  const [result, setResult] = useState<FinishResult | null>(null);

  const info = levelInfo(activeLevel);
  const ActiveGame = GAME_COMPONENTS[info.kind];
  const mods = modifiersFor(null, event);

  const afterSplash = () => {
    if (!ready) return;
    setScreen(state.playerName ? "menu" : "name");
  };

  const startQuest = () => {
    markStorySeen();
    setScreen("map");
  };

  const enterLevel = (num: number) => {
    setActiveLevel(num);
    setEvent(randomEvent());
    setScreen("play");
  };

  const handleFinish = (score: number) => {
    setResult(finishLevel(activeLevel, score, mods, null));
    setScreen("result");
  };

  const render = () => {
    switch (screen) {
      case "splash":
        return <Splash onDone={afterSplash} />;
      case "name":
        return (
          <Onboarding
            onSubmit={(name) => {
              setPlayerName(name);
              setScreen("story");
            }}
          />
        );
      case "story":
        return <Story onBegin={startQuest} />;
      case "menu":
        return <MainMenu onPlay={() => setScreen(state.seenStory ? "map" : "story")} />;
      case "map":
        return <WorldMap onBack={() => setScreen("menu")} onEnter={enterLevel} />;
      case "play":
        return (
          <ActiveGame
            onExit={() => setScreen("map")}
            onFinish={handleFinish}
            difficulty={info.difficulty}
            extraTime={mods.extraTime}
            hero={costumeEmoji(state)}
          />
        );
      case "result":
        return result ? (
          <ResultScreen
            result={result}
            event={event}
            onReplay={() => enterLevel(activeLevel)}
            onMap={() => setScreen("map")}
            onCelebrate={() => setScreen("grand")}
          />
        ) : null;
      case "grand":
        return <GrandCelebration onMenu={() => setScreen("menu")} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen + (screen === "play" ? activeLevel : "")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {render()}
      </motion.div>
    </AnimatePresence>
  );
}
