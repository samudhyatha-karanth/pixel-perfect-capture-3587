import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type GameId = "flower" | "modak" | "pandal" | "eco" | "dhol";

export const GAME_ORDER: GameId[] = ["flower", "modak", "pandal", "eco", "dhol"];

export type LocationInfo = {
  id: GameId;
  name: string;
  game: string;
  emoji: string;
  blurb: string;
  reward: string;
  rewardEmoji: string;
};

export const LOCATIONS: LocationInfo[] = [
  {
    id: "flower",
    name: "Flower Market",
    game: "Flower Rush",
    emoji: "🌸",
    blurb: "Catch falling marigolds for the garlands.",
    reward: "Marigold Garland",
    rewardEmoji: "🌼",
  },
  {
    id: "modak",
    name: "Modak Kitchen",
    game: "Modak Master",
    emoji: "🍬",
    blurb: "Steam the perfect modak at the perfect moment.",
    reward: "Golden Modak",
    rewardEmoji: "🥟",
  },
  {
    id: "pandal",
    name: "Festival Pandal",
    game: "Pandal Builder",
    emoji: "🎪",
    blurb: "Stack the decorations without toppling the pandal.",
    reward: "Silk Canopy",
    rewardEmoji: "🎋",
  },
  {
    id: "eco",
    name: "Eco Zone",
    game: "Eco Challenge",
    emoji: "♻️",
    blurb: "Sort festival waste and keep the river clean.",
    reward: "Green Vow Badge",
    rewardEmoji: "🌿",
  },
  {
    id: "dhol",
    name: "Celebration Stage",
    game: "Dhol Rhythm",
    emoji: "🥁",
    blurb: "Tap the beat and lead the procession.",
    reward: "Thunder Dhol",
    rewardEmoji: "🪘",
  },
];

export type Achievement = { id: string; name: string; note: string; emoji: string };

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", name: "First Steps", note: "Complete your first mini-game", emoji: "👣" },
  { id: "sweet-tooth", name: "Sweet Tooth", note: "Score 300+ in Modak Master", emoji: "🍯" },
  { id: "eco-hero", name: "Eco Hero", note: "Score 300+ in Eco Challenge", emoji: "🌍" },
  { id: "rhythm-soul", name: "Rhythm Soul", note: "Score 300+ in Dhol Rhythm", emoji: "🎶" },
  { id: "collector", name: "Curator", note: "Collect 3 festival treasures", emoji: "🧺" },
  { id: "grand", name: "Grand Celebration", note: "Finish every challenge", emoji: "🎆" },
];

export type Settings = { sound: boolean; effects: boolean };

export type GameState = {
  playerName: string;
  totalBlessingPoints: number;
  completedGames: GameId[];
  achievements: string[];
  collection: string[];
  unlockedLocations: GameId[];
  highScores: Partial<Record<GameId, number>>;
  settings: Settings;
  seenStory: boolean;
};

const STORAGE_KEY = "vighnaverse.save.v1";

export const defaultState: GameState = {
  playerName: "",
  totalBlessingPoints: 0,
  completedGames: [],
  achievements: [],
  collection: [],
  unlockedLocations: ["flower"],
  highScores: {},
  settings: { sound: true, effects: true },
  seenStory: false,
};

function sanitize(raw: unknown): GameState {
  if (!raw || typeof raw !== "object") return { ...defaultState };
  const r = raw as Record<string, unknown>;
  const ids = (v: unknown): GameId[] =>
    Array.isArray(v) ? (v.filter((x) => GAME_ORDER.includes(x as GameId)) as GameId[]) : [];
  const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);
  const scores: Partial<Record<GameId, number>> = {};
  const rawScores = r["highScores"];
  if (rawScores && typeof rawScores === "object") {
    for (const id of GAME_ORDER) {
      const v = (rawScores as Record<string, unknown>)[id];
      if (typeof v === "number" && Number.isFinite(v)) scores[id] = Math.max(0, Math.round(v));
    }
  }
  const settings = (r["settings"] ?? {}) as Record<string, unknown>;
  const unlocked = ids(r["unlockedLocations"]);
  const name = r["playerName"];
  const points = r["totalBlessingPoints"];
  return {
    playerName: typeof name === "string" ? name.slice(0, 18) : "",
    totalBlessingPoints:
      typeof points === "number" && Number.isFinite(points) ? Math.max(0, Math.round(points)) : 0,
    completedGames: ids(r["completedGames"]),
    achievements: strings(r["achievements"]),
    collection: strings(r["collection"]),
    unlockedLocations: unlocked.length ? Array.from(new Set(["flower" as GameId, ...unlocked])) : ["flower"],
    highScores: scores,
    settings: {
      sound: settings["sound"] !== false,
      effects: settings["effects"] !== false,
    },
    seenStory: r["seenStory"] === true,
  };
}

export function loadState(): GameState {
  if (typeof window === "undefined") return { ...defaultState };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    return sanitize(JSON.parse(raw));
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return { ...defaultState };
  }
}

function saveState(state: GameState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

export function levelFor(points: number) {
  return Math.floor(points / 250) + 1;
}
export function levelProgress(points: number) {
  return (points % 250) / 250;
}

export type FinishResult = {
  points: number;
  best: boolean;
  unlocked?: LocationInfo;
  reward?: LocationInfo;
  newAchievements: Achievement[];
  allDone: boolean;
};

type Ctx = {
  state: GameState;
  ready: boolean;
  setPlayerName: (name: string) => void;
  markStorySeen: () => void;
  toggleSetting: (key: keyof Settings) => void;
  resetProgress: () => void;
  finishGame: (id: GameId, score: number) => FinishResult;
};

const GameContext = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const setPlayerName = useCallback((name: string) => {
    setState((s) => ({ ...s, playerName: name.trim().slice(0, 18) || "Festival Explorer" }));
  }, []);

  const markStorySeen = useCallback(() => setState((s) => ({ ...s, seenStory: true })), []);

  const toggleSetting = useCallback((key: keyof Settings) => {
    setState((s) => ({ ...s, settings: { ...s.settings, [key]: !s.settings[key] } }));
  }, []);

  const resetProgress = useCallback(() => setState({ ...defaultState }), []);

  const finishGame = useCallback((id: GameId, score: number) => {
    const result: FinishResult = { points: score, best: false, newAchievements: [], allDone: false };
    setState((s) => {
      const prevBest = s.highScores[id] ?? 0;
      result.best = score > prevBest;

      const completedGames = s.completedGames.includes(id) ? s.completedGames : [...s.completedGames, id];
      const idx = GAME_ORDER.indexOf(id);
      const next = GAME_ORDER[idx + 1];
      const unlockedLocations = next && !s.unlockedLocations.includes(next) ? [...s.unlockedLocations, next] : s.unlockedLocations;
      if (next && !s.unlockedLocations.includes(next)) {
        const loc = LOCATIONS.find((l) => l.id === next);
        if (loc) result.unlocked = loc;
      }

      const info = LOCATIONS.find((l) => l.id === id)!;
      const collection = s.collection.includes(info.reward) ? s.collection : [...s.collection, info.reward];
      if (!s.collection.includes(info.reward)) result.reward = info;

      const earned = new Set(s.achievements);
      const add = (aid: string) => {
        if (!earned.has(aid)) {
          earned.add(aid);
          const a = ACHIEVEMENTS.find((x) => x.id === aid);
          if (a) result.newAchievements.push(a);
        }
      };
      add("first-step");
      if (id === "modak" && score >= 300) add("sweet-tooth");
      if (id === "eco" && score >= 300) add("eco-hero");
      if (id === "dhol" && score >= 300) add("rhythm-soul");
      if (collection.length >= 3) add("collector");
      const allDone = GAME_ORDER.every((g) => completedGames.includes(g));
      if (allDone) add("grand");
      result.allDone = allDone;

      return {
        ...s,
        totalBlessingPoints: s.totalBlessingPoints + score,
        completedGames,
        unlockedLocations,
        collection,
        achievements: Array.from(earned),
        highScores: { ...s.highScores, [id]: Math.max(prevBest, score) },
      };
    });
    return result;
  }, []);

  const value = useMemo(
    () => ({ state, ready, setPlayerName, markStorySeen, toggleSetting, resetProgress, finishGame }),
    [state, ready, setPlayerName, markStorySeen, toggleSetting, resetProgress, finishGame],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
