import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/* ────────────────────────────── Types & content ───────────────────────────── */

export type GameKind =
  | "flower"
  | "modak"
  | "pandal"
  | "eco"
  | "dhol"
  | "delivery"
  | "treasure"
  | "memory"
  | "obstacle"
  | "champion";

export type WorldInfo = { id: number; name: string; emoji: string; blurb: string };

export const WORLDS: WorldInfo[] = [
  { id: 1, name: "Festival Preparation", emoji: "🌸", blurb: "Gather flowers, sweets and build the pandal." },
  { id: 2, name: "Festival Challenges", emoji: "🥁", blurb: "Keep the city green, loud and well fed." },
  { id: 3, name: "Sacred Quest", emoji: "🔱", blurb: "Hunt treasures, test memory and outrun trouble." },
  { id: 4, name: "Grand Celebration", emoji: "🎆", blurb: "One final challenge for the Festival Legend." },
];

export type LevelInfo = {
  num: number;
  world: number;
  kind: GameKind;
  name: string;
  place: string;
  emoji: string;
  blurb: string;
  difficulty: 1 | 2 | 3 | 4;
  boss: boolean;
  target: number;
  reward: string;
  rewardEmoji: string;
};

export const LEVELS: LevelInfo[] = [
  {
    num: 1, world: 1, kind: "flower", name: "Flower Rush", place: "Flower Market", emoji: "🌸",
    blurb: "Catch falling marigolds for the garlands.", difficulty: 1, boss: false, target: 320,
    reward: "Marigold Garland", rewardEmoji: "🌼",
  },
  {
    num: 2, world: 1, kind: "modak", name: "Modak Master", place: "Modak Kitchen", emoji: "🍬",
    blurb: "Steam the perfect modak at the perfect moment.", difficulty: 1, boss: false, target: 300,
    reward: "Golden Modak", rewardEmoji: "🥟",
  },
  {
    num: 3, world: 1, kind: "pandal", name: "Decoration Master Challenge", place: "Festival Pandal", emoji: "🎪",
    blurb: "BOSS — stack the tallest pandal without toppling.", difficulty: 2, boss: true, target: 380,
    reward: "Silk Canopy", rewardEmoji: "🎋",
  },
  {
    num: 4, world: 2, kind: "eco", name: "Eco Hero", place: "Eco Zone", emoji: "♻️",
    blurb: "Sort festival waste and keep the river clean.", difficulty: 2, boss: false, target: 340,
    reward: "Green Vow Badge", rewardEmoji: "🌿",
  },
  {
    num: 5, world: 2, kind: "dhol", name: "Rhythm Celebration", place: "Celebration Stage", emoji: "🥁",
    blurb: "Tap the beat and lead the procession.", difficulty: 2, boss: false, target: 360,
    reward: "Thunder Dhol", rewardEmoji: "🪘",
  },
  {
    num: 6, world: 2, kind: "delivery", name: "Speed Delivery Challenge", place: "Festival Lanes", emoji: "🛵",
    blurb: "BOSS — dodge puddles and deliver every item on time.", difficulty: 3, boss: true, target: 420,
    reward: "Delivery Cart", rewardEmoji: "🛺",
  },
  {
    num: 7, world: 3, kind: "treasure", name: "Treasure Hunt", place: "Old Village", emoji: "🗺️",
    blurb: "Follow the clues and find the hidden relics.", difficulty: 3, boss: false, target: 400,
    reward: "Sacred Lamp", rewardEmoji: "🪔",
  },
  {
    num: 8, world: 3, kind: "memory", name: "Memory Challenge", place: "Temple Courtyard", emoji: "🧠",
    blurb: "Match the festival pairs before the clock runs out.", difficulty: 3, boss: false, target: 400,
    reward: "Festival Bell", rewardEmoji: "🔔",
  },
  {
    num: 9, world: 3, kind: "obstacle", name: "Ultimate Obstacle Run", place: "Riverside Road", emoji: "🏃",
    blurb: "BOSS — jump the rocks and rivers with three lives.", difficulty: 4, boss: true, target: 450,
    reward: "Lotus Flower", rewardEmoji: "🪷",
  },
  {
    num: 10, world: 4, kind: "champion", name: "Festival Champion Challenge", place: "Grand Pandal", emoji: "👑",
    blurb: "Every mechanic, one gauntlet. Become the Festival Legend.", difficulty: 4, boss: true, target: 500,
    reward: "Festival Legend Trophy", rewardEmoji: "🏆",
  },
];

export function levelInfo(num: number): LevelInfo {
  return LEVELS.find((l) => l.num === num) ?? LEVELS[0]!;
}

/* Power-ups */
export type PowerUpId = "golden-modak" | "magic-flower" | "shield" | "time-booster" | "lucky-bell";
export type PowerUp = { id: PowerUpId; name: string; emoji: string; note: string };

export const POWERUPS: PowerUp[] = [
  { id: "golden-modak", name: "Golden Modak", emoji: "🥟", note: "Double points this round" },
  { id: "magic-flower", name: "Magic Flower", emoji: "🌺", note: "1.5x score multiplier" },
  { id: "shield", name: "Festival Shield", emoji: "🛡️", note: "Pass the level even on a low score" },
  { id: "time-booster", name: "Time Booster", emoji: "⏱️", note: "+10 seconds of playtime" },
  { id: "lucky-bell", name: "Lucky Bell", emoji: "🔔", note: "Triple coins this round" },
];

export function powerUpInfo(id: PowerUpId) {
  return POWERUPS.find((p) => p.id === id)!;
}

/* Surprise events */
export type SurpriseEvent = { id: string; name: string; emoji: string; note: string; bonus: number };

export const EVENTS: SurpriseEvent[] = [
  { id: "flower-rain", name: "Golden Flower Rain", emoji: "🌧️", note: "Petals of gold fall — +25% score", bonus: 1.25 },
  { id: "bonus-modak", name: "Bonus Modak Round", emoji: "🥟", note: "Bappa is hungry — +30% score", bonus: 1.3 },
  { id: "treasure-boom", name: "Treasure Explosion", emoji: "💎", note: "Coins burst everywhere — +40% score", bonus: 1.4 },
  { id: "parade", name: "Festival Parade", emoji: "🎊", note: "The crowd cheers you on — +20% score", bonus: 1.2 },
];

/* Costumes */
export type Costume = { id: string; name: string; emoji: string; req: string; unlock: (s: GameState) => boolean };

export const COSTUMES: Costume[] = [
  { id: "classic", name: "Mushak", emoji: "🐭", req: "Always yours", unlock: () => true },
  { id: "festival", name: "Festival Mushak", emoji: "🐹", req: "Clear 3 levels", unlock: (s) => s.completedLevels.length >= 3 },
  { id: "eco", name: "Eco Hero Mushak", emoji: "🐿️", req: "Clear the Eco Zone", unlock: (s) => s.completedLevels.includes(4) },
  { id: "royal", name: "Royal Mushak", emoji: "🦫", req: "Clear 7 levels", unlock: (s) => s.completedLevels.length >= 7 },
  { id: "golden", name: "Golden Mushak", emoji: "🐀", req: "Become Festival Champion", unlock: (s) => s.completedLevels.includes(10) },
];

/* Titles */
export type Title = { id: string; name: string; req: string; unlock: (s: GameState) => boolean };

export const TITLES: Title[] = [
  { id: "helper", name: "Festival Helper", req: "Clear level 1", unlock: (s) => s.completedLevels.length >= 1 },
  { id: "modak-master", name: "Modak Master", req: "Clear Modak Master", unlock: (s) => s.completedLevels.includes(2) },
  { id: "eco-guardian", name: "Eco Guardian", req: "Clear Eco Hero", unlock: (s) => s.completedLevels.includes(4) },
  { id: "rhythm-hero", name: "Rhythm Hero", req: "Clear Rhythm Celebration", unlock: (s) => s.completedLevels.includes(5) },
  { id: "treasure-seeker", name: "Treasure Seeker", req: "Clear the Treasure Hunt", unlock: (s) => s.completedLevels.includes(7) },
  { id: "legend", name: "Festival Legend", req: "Clear every level", unlock: (s) => s.completedLevels.length >= LEVELS.length },
];

/* Achievements */
export type Achievement = { id: string; name: string; note: string; emoji: string };

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", name: "First Steps", note: "Complete your first level", emoji: "👣" },
  { id: "sweet-tooth", name: "Sweet Tooth", note: "Score 300+ in Modak Master", emoji: "🍯" },
  { id: "eco-hero", name: "Eco Hero", note: "Score 300+ in Eco Hero", emoji: "🌍" },
  { id: "rhythm-soul", name: "Rhythm Soul", note: "Score 300+ in Rhythm Celebration", emoji: "🎶" },
  { id: "collector", name: "Curator", note: "Collect 3 festival treasures", emoji: "🧺" },
  { id: "boss-slayer", name: "Boss Slayer", note: "Beat a boss challenge", emoji: "⚔️" },
  { id: "three-star", name: "Perfectionist", note: "Earn 3 stars on any level", emoji: "⭐" },
  { id: "world-2", name: "Into the Streets", note: "Unlock World 2", emoji: "🛣️" },
  { id: "rich", name: "Coin Collector", note: "Save up 500 coins", emoji: "🪙" },
  { id: "grand", name: "Grand Celebration", note: "Finish every level", emoji: "🎆" },
];

/* Quests */
export type QuestMetric = "score" | "levels" | "coins" | "stars";
export type Quest = { id: string; name: string; metric: QuestMetric; goal: number; reward: number };

export const DAILY_QUESTS: Quest[] = [
  { id: "d-score", name: "Score 1000 points today", metric: "score", goal: 1000, reward: 120 },
  { id: "d-levels", name: "Complete 3 challenges", metric: "levels", goal: 3, reward: 100 },
  { id: "d-coins", name: "Earn 150 coins", metric: "coins", goal: 150, reward: 90 },
];

export const WEEKLY_QUESTS: Quest[] = [
  { id: "w-levels", name: "Complete 10 challenges", metric: "levels", goal: 10, reward: 400 },
  { id: "w-stars", name: "Earn 15 stars", metric: "stars", goal: 15, reward: 350 },
];

export type Settings = { sound: boolean; effects: boolean };

export type QuestProgress = { key: string; progress: Record<string, number>; claimed: string[] };

export type GameState = {
  playerName: string;
  totalBlessingPoints: number;
  coins: number;
  xp: number;
  completedLevels: number[];
  unlockedLevel: number;
  stars: Record<string, number>;
  highScores: Record<string, number>;
  achievements: string[];
  collection: string[];
  titles: string[];
  activeTitle: string;
  costumes: string[];
  activeCostume: string;
  powerUps: Record<string, number>;
  daily: QuestProgress;
  weekly: QuestProgress;
  settings: Settings;
  seenStory: boolean;
};

const STORAGE_KEY = "vighnaverse.save.v2";

export const defaultState: GameState = {
  playerName: "",
  totalBlessingPoints: 0,
  coins: 0,
  xp: 0,
  completedLevels: [],
  unlockedLevel: 1,
  stars: {},
  highScores: {},
  achievements: [],
  collection: [],
  titles: [],
  activeTitle: "",
  costumes: ["classic"],
  activeCostume: "classic",
  powerUps: { "golden-modak": 1, "time-booster": 1 },
  daily: { key: "", progress: {}, claimed: [] },
  weekly: { key: "", progress: {}, claimed: [] },
  settings: { sound: true, effects: true },
  seenStory: false,
};

/* ─────────────────────────────── Persistence ─────────────────────────────── */

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
function weekKey(d = new Date()) {
  const t = new Date(d);
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return `w-${t.toISOString().slice(0, 10)}`;
}

function numRecord(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === "number" && Number.isFinite(val)) out[k] = Math.max(0, Math.round(val));
    }
  }
  return out;
}
function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}
function numList(v: unknown): number[] {
  return Array.isArray(v) ? v.filter((x): x is number => typeof x === "number" && Number.isFinite(x)) : [];
}
function int(v: unknown, fallback = 0) {
  return typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.round(v)) : fallback;
}
function questProgress(v: unknown): QuestProgress {
  const r = (v ?? {}) as Record<string, unknown>;
  return {
    key: typeof r["key"] === "string" ? r["key"] : "",
    progress: numRecord(r["progress"]),
    claimed: strList(r["claimed"]),
  };
}

function sanitize(raw: unknown): GameState {
  if (!raw || typeof raw !== "object") return { ...defaultState };
  const r = raw as Record<string, unknown>;
  const settings = (r["settings"] ?? {}) as Record<string, unknown>;
  const costumes = strList(r["costumes"]);
  const name = r["playerName"];
  return {
    playerName: typeof name === "string" ? name.slice(0, 18) : "",
    totalBlessingPoints: int(r["totalBlessingPoints"]),
    coins: int(r["coins"]),
    xp: int(r["xp"]),
    completedLevels: numList(r["completedLevels"]).filter((n) => n >= 1 && n <= LEVELS.length),
    unlockedLevel: Math.min(LEVELS.length, Math.max(1, int(r["unlockedLevel"], 1))),
    stars: numRecord(r["stars"]),
    highScores: numRecord(r["highScores"]),
    achievements: strList(r["achievements"]),
    collection: strList(r["collection"]),
    titles: strList(r["titles"]),
    activeTitle: typeof r["activeTitle"] === "string" ? r["activeTitle"] : "",
    costumes: costumes.length ? Array.from(new Set(["classic", ...costumes])) : ["classic"],
    activeCostume: typeof r["activeCostume"] === "string" ? r["activeCostume"] : "classic",
    powerUps: numRecord(r["powerUps"]),
    daily: questProgress(r["daily"]),
    weekly: questProgress(r["weekly"]),
    settings: { sound: settings["sound"] !== false, effects: settings["effects"] !== false },
    seenStory: r["seenStory"] === true,
  };
}

function rollQuests(s: GameState): GameState {
  const d = dayKey();
  const w = weekKey();
  let next = s;
  if (s.daily.key !== d) next = { ...next, daily: { key: d, progress: {}, claimed: [] } };
  if (s.weekly.key !== w) next = { ...next, weekly: { key: w, progress: {}, claimed: [] } };
  return next;
}

export function loadState(): GameState {
  if (typeof window === "undefined") return { ...defaultState };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return rollQuests({ ...defaultState });
    return rollQuests(sanitize(JSON.parse(raw)));
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

/* ───────────────────────────────── Helpers ───────────────────────────────── */

export function levelFor(points: number) {
  return Math.floor(points / 250) + 1;
}
export function levelProgress(points: number) {
  return (points % 250) / 250;
}
export function rankFor(points: number) {
  const lvl = levelFor(points);
  if (lvl >= 16) return "Festival Legend";
  if (lvl >= 11) return "Advanced";
  if (lvl >= 6) return "Intermediate";
  return "Beginner";
}
export function totalStars(s: GameState) {
  return Object.values(s.stars).reduce((a, b) => a + b, 0);
}
export function costumeEmoji(s: GameState) {
  return COSTUMES.find((c) => c.id === s.activeCostume)?.emoji ?? "🐭";
}
export function starsFor(score: number, target: number) {
  if (score >= target) return 3;
  if (score >= target * 0.7) return 2;
  if (score >= target * 0.45) return 1;
  return 0;
}
export function randomEvent(): SurpriseEvent | null {
  if (Math.random() > 0.45) return null;
  return EVENTS[Math.floor(Math.random() * EVENTS.length)] ?? null;
}

export type RoundModifiers = { scoreMultiplier: number; coinMultiplier: number; extraTime: number; shield: boolean };

export function modifiersFor(powerUp: PowerUpId | null, event: SurpriseEvent | null): RoundModifiers {
  const m: RoundModifiers = { scoreMultiplier: 1, coinMultiplier: 1, extraTime: 0, shield: false };
  if (event) m.scoreMultiplier *= event.bonus;
  switch (powerUp) {
    case "golden-modak":
      m.scoreMultiplier *= 2;
      break;
    case "magic-flower":
      m.scoreMultiplier *= 1.5;
      break;
    case "time-booster":
      m.extraTime = 10;
      break;
    case "lucky-bell":
      m.coinMultiplier *= 3;
      break;
    case "shield":
      m.shield = true;
      break;
    default:
      break;
  }
  return m;
}

/* ──────────────────────────────── Finishing ──────────────────────────────── */

export type FinishResult = {
  level: LevelInfo;
  rawScore: number;
  points: number;
  coins: number;
  stars: number;
  passed: boolean;
  best: boolean;
  unlockedLevel?: LevelInfo;
  reward?: LevelInfo;
  newAchievements: Achievement[];
  newTitles: Title[];
  newCostumes: Costume[];
  powerUpWon: PowerUp | null;
  questsCompleted: string[];
  allDone: boolean;
};

type Ctx = {
  state: GameState;
  ready: boolean;
  setPlayerName: (name: string) => void;
  markStorySeen: () => void;
  toggleSetting: (key: keyof Settings) => void;
  resetProgress: () => void;
  setCostume: (id: string) => void;
  setTitle: (id: string) => void;
  claimQuest: (scope: "daily" | "weekly", id: string) => void;
  finishLevel: (num: number, rawScore: number, mods: RoundModifiers, usedPowerUp: PowerUpId | null) => FinishResult;
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

  const resetProgress = useCallback(() => setState(rollQuests({ ...defaultState })), []);

  const setCostume = useCallback((id: string) => {
    setState((s) => (s.costumes.includes(id) ? { ...s, activeCostume: id } : s));
  }, []);

  const setTitle = useCallback((id: string) => {
    setState((s) => (s.titles.includes(id) ? { ...s, activeTitle: id } : s));
  }, []);

  const claimQuest = useCallback((scope: "daily" | "weekly", id: string) => {
    setState((s) => {
      const pool = scope === "daily" ? DAILY_QUESTS : WEEKLY_QUESTS;
      const q = pool.find((x) => x.id === id);
      const bag = s[scope];
      if (!q || bag.claimed.includes(id) || (bag.progress[id] ?? 0) < q.goal) return s;
      return { ...s, coins: s.coins + q.reward, [scope]: { ...bag, claimed: [...bag.claimed, id] } } as GameState;
    });
  }, []);

  const finishLevel = useCallback(
    (num: number, rawScore: number, mods: RoundModifiers, usedPowerUp: PowerUpId | null) => {
      const info = levelInfo(num);
      const points = Math.round(Math.max(0, rawScore) * mods.scoreMultiplier);
      const stars = Math.max(starsFor(points, info.target), mods.shield ? 1 : 0);
      const passed = stars > 0;
      const coins = Math.round((points / 8) * mods.coinMultiplier * (info.boss ? 2 : 1));

      const result: FinishResult = {
        level: info,
        rawScore,
        points,
        coins,
        stars,
        passed,
        best: false,
        newAchievements: [],
        newTitles: [],
        newCostumes: [],
        powerUpWon: null,
        questsCompleted: [],
        allDone: false,
      };

      setState((prev) => {
        let s = rollQuests(prev);
        const key = String(num);
        const prevBest = s.highScores[key] ?? 0;
        result.best = points > prevBest;

        if (usedPowerUp) {
          const left = Math.max(0, (s.powerUps[usedPowerUp] ?? 0) - 1);
          s = { ...s, powerUps: { ...s.powerUps, [usedPowerUp]: left } };
        }

        s = {
          ...s,
          totalBlessingPoints: s.totalBlessingPoints + points,
          xp: s.xp + points,
          coins: s.coins + coins,
          highScores: { ...s.highScores, [key]: Math.max(prevBest, points) },
          stars: { ...s.stars, [key]: Math.max(s.stars[key] ?? 0, stars) },
        };

        if (passed) {
          const completedLevels = s.completedLevels.includes(num) ? s.completedLevels : [...s.completedLevels, num];
          const unlockedLevel = Math.min(LEVELS.length, Math.max(s.unlockedLevel, num + 1));
          if (unlockedLevel > s.unlockedLevel) result.unlockedLevel = levelInfo(unlockedLevel);
          const collection = s.collection.includes(info.reward) ? s.collection : [...s.collection, info.reward];
          if (!s.collection.includes(info.reward)) result.reward = info;
          s = { ...s, completedLevels, unlockedLevel, collection };

          // power-up drop
          if (Math.random() < (info.boss ? 1 : 0.45)) {
            const won = POWERUPS[Math.floor(Math.random() * POWERUPS.length)]!;
            result.powerUpWon = won;
            s = { ...s, powerUps: { ...s.powerUps, [won.id]: (s.powerUps[won.id] ?? 0) + 1 } };
          }
        }

        // quests
        const bump = (scope: "daily" | "weekly", pool: Quest[]) => {
          const bag = s[scope];
          const progress = { ...bag.progress };
          for (const q of pool) {
            const add =
              q.metric === "score" ? points : q.metric === "coins" ? coins : q.metric === "stars" ? stars : passed ? 1 : 0;
            const before = progress[q.id] ?? 0;
            const after = before + add;
            progress[q.id] = after;
            if (before < q.goal && after >= q.goal) result.questsCompleted.push(q.name);
          }
          s = { ...s, [scope]: { ...bag, progress } } as GameState;
        };
        bump("daily", DAILY_QUESTS);
        bump("weekly", WEEKLY_QUESTS);

        // achievements
        const earned = new Set(s.achievements);
        const add = (aid: string) => {
          if (!earned.has(aid)) {
            earned.add(aid);
            const a = ACHIEVEMENTS.find((x) => x.id === aid);
            if (a) result.newAchievements.push(a);
          }
        };
        if (passed) add("first-step");
        if (info.kind === "modak" && points >= 300) add("sweet-tooth");
        if (info.kind === "eco" && points >= 300) add("eco-hero");
        if (info.kind === "dhol" && points >= 300) add("rhythm-soul");
        if (s.collection.length >= 3) add("collector");
        if (passed && info.boss) add("boss-slayer");
        if (stars >= 3) add("three-star");
        if (s.unlockedLevel >= 4) add("world-2");
        if (s.coins >= 500) add("rich");
        const allDone = s.completedLevels.length >= LEVELS.length;
        if (allDone) add("grand");
        result.allDone = allDone;
        s = { ...s, achievements: Array.from(earned) };

        // titles & costumes
        const titles = new Set(s.titles);
        for (const t of TITLES) {
          if (!titles.has(t.id) && t.unlock(s)) {
            titles.add(t.id);
            result.newTitles.push(t);
          }
        }
        const costumes = new Set(s.costumes);
        for (const c of COSTUMES) {
          if (!costumes.has(c.id) && c.unlock(s)) {
            costumes.add(c.id);
            result.newCostumes.push(c);
          }
        }
        s = {
          ...s,
          titles: Array.from(titles),
          costumes: Array.from(costumes),
          activeTitle: s.activeTitle || (result.newTitles[0]?.id ?? ""),
        };

        return s;
      });

      return result;
    },
    [],
  );

  const value = useMemo(
    () => ({
      state,
      ready,
      setPlayerName,
      markStorySeen,
      toggleSetting,
      resetProgress,
      setCostume,
      setTitle,
      claimQuest,
      finishLevel,
    }),
    [state, ready, setPlayerName, markStorySeen, toggleSetting, resetProgress, setCostume, setTitle, claimQuest, finishLevel],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
