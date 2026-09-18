import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  GameProvider,
  LOCATIONS,
  useGame,
  type FinishResult,
  type GameId,
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
import type { MiniGameProps } from "@/components/games/GameFrame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VighnaVerse — Where Every Obstacle Becomes an Adventure" },
      {
        name: "description",
        content:
          "Help Mushak prepare a grand Ganesh Chaturthi celebration in VighnaVerse: five festival mini-games, blessing points, treasures and a grand finale.",
      },
      { property: "og:title", content: "VighnaVerse — Festival Adventure Game" },
      {
        property: "og:description",
        content: "Catch marigolds, steam modaks, build the pandal, keep the festival green and master the dhol beat.",
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

const GAME_COMPONENTS: Record<GameId, (p: MiniGameProps) => React.JSX.Element> = {
  flower: FlowerRush,
  modak: ModakMaster,
  pandal: PandalBuilder,
  eco: EcoChallenge,
  dhol: DholRhythm,
};

function VighnaVerse() {
  const { state, ready, setPlayerName, markStorySeen, finishGame } = useGame();
  const [screen, setScreen] = useState<Screen>("splash");
  const [active, setActive] = useState<GameId>("flower");
  const [result, setResult] = useState<FinishResult | null>(null);

  const location = LOCATIONS.find((l) => l.id === active)!;
  const ActiveGame = GAME_COMPONENTS[active];

  const afterSplash = () => {
    if (!ready) return;
    setScreen(state.playerName ? "menu" : "name");
  };

  const startQuest = () => {
    markStorySeen();
    setScreen("map");
  };

  const handleFinish = (score: number) => {
    const res = finishGame(active, score);
    setResult(res);
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
        return (
          <WorldMap
            onBack={() => setScreen("menu")}
            onEnter={(id) => {
              setActive(id);
              setScreen("play");
            }}
          />
        );
      case "play":
        return <ActiveGame onExit={() => setScreen("map")} onFinish={handleFinish} />;
      case "result":
        return result ? (
          <ResultScreen
            location={location}
            result={result}
            onReplay={() => setScreen("play")}
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
        key={screen + (screen === "play" ? active : "")}
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
