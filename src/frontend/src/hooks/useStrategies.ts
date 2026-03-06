import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Strategy {
  id: string;
  authorId: string;
  authorName: string;
  name: string;
  entryModelDescription: string;
  marketContext: string;
  timeframes: string[];
  isPublic: boolean;
  totalTrades: number;
  winRate: number;
  avgRR: number;
  profitFactor: number;
  tradesSummary: string;
  createdAt: number;
}

type CreateStrategyInput = Omit<Strategy, "id" | "createdAt">;

const STORAGE_KEY = "smc-strategies";

function loadStrategies(): Strategy[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Strategy[];
  } catch {}
  return [];
}

function saveStrategies(strategies: Strategy[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(strategies));
  } catch {}
}

// Seed some demo strategies so the Discover tab isn't empty on first load
function seedDemoStrategies() {
  const existing = loadStrategies();
  if (existing.length > 0) return;

  const demos: Strategy[] = [
    {
      id: "demo-1",
      authorId: "demo-principal-1",
      authorName: "Alex Rivers",
      name: "London Open OB Sniper",
      entryModelDescription:
        "Wait for London session open sweep of Asian range lows/highs. Enter on H1 Order Block retest with M15 CHoCH confirmation. Look for displacement candles and FVGs within the OB zone.",
      marketContext:
        "Bullish or Bearish daily bias confirmed on D1 and H4. Market must show a clear displacement move before the OB is formed. Avoid ranging conditions.",
      timeframes: ["H1", "M15", "M5"],
      isPublic: true,
      totalTrades: 187,
      winRate: 68.4,
      avgRR: 2.8,
      profitFactor: 2.4,
      tradesSummary:
        "Primarily trades EURUSD, GBPUSD, and XAUUSD during London open (7-10 AM GMT). Best results on Tuesday–Thursday. Avoid Monday and Friday.",
      createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    },
    {
      id: "demo-2",
      authorId: "demo-principal-2",
      authorName: "Mia Chen",
      name: "NY Open FVG Scalp",
      entryModelDescription:
        "Identify Fair Value Gaps created during pre-market or Asia session. During NY open (2:30–4 PM GMT), wait for price to retrace into FVG, then enter on M1 or M5 confirmation. Target next liquidity pool.",
      marketContext:
        "Must have clear H4 directional bias. Dollar Index (DXY) correlation check required. Avoid news events within 30 minutes of trade.",
      timeframes: ["H4", "H1", "M5", "M1"],
      isPublic: true,
      totalTrades: 243,
      winRate: 72.0,
      avgRR: 2.2,
      profitFactor: 2.8,
      tradesSummary:
        "Works best on NASDAQ and SPX500 indices plus EURUSD. Over 3 months of tracked data with consistent profitability. Monthly average 12-15% account growth.",
      createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
    },
    {
      id: "demo-3",
      authorId: "demo-principal-3",
      authorName: "Tariq Hassan",
      name: "XAUUSD Swing HTF OTE",
      entryModelDescription:
        "Enter at Optimal Trade Entry (OTE) zones on D1 Order Blocks for XAUUSD swing positions. 62–79% retracement into the OB after a strong displacement. Set wide SL below the full OB. Target 3-5R.",
      marketContext:
        "Weekly and Monthly bias aligned. DXY in premium/discount. Gold in discount on weekly. No major economic events in next 48 hours.",
      timeframes: ["D1", "H4", "H1"],
      isPublic: true,
      totalTrades: 94,
      winRate: 62.8,
      avgRR: 3.9,
      profitFactor: 2.6,
      tradesSummary:
        "Swing strategy, 1-3 trades per week. Requires patience. Best months: Jan, Mar, Sep, Oct. Drawdown periods occur during consolidation on weekly chart.",
      createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
    },
  ];

  saveStrategies(demos);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStrategies(currentUserId?: string) {
  const [strategies, setStrategies] = useState<Strategy[]>(() => {
    seedDemoStrategies();
    return loadStrategies();
  });

  const refresh = useCallback(() => {
    setStrategies(loadStrategies());
  }, []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const publishStrategy = useCallback((input: CreateStrategyInput) => {
    const strategy: Strategy = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const next = [...loadStrategies(), strategy];
    saveStrategies(next);
    setStrategies(next);
    return strategy;
  }, []);

  const deleteStrategy = useCallback((id: string) => {
    const next = loadStrategies().filter((s) => s.id !== id);
    saveStrategies(next);
    setStrategies(next);
  }, []);

  const updateStrategy = useCallback((updated: Strategy) => {
    const next = loadStrategies().map((s) =>
      s.id === updated.id ? updated : s,
    );
    saveStrategies(next);
    setStrategies(next);
  }, []);

  const publicStrategies = strategies.filter((s) => s.isPublic);
  const myStrategies = currentUserId
    ? strategies.filter((s) => s.authorId === currentUserId)
    : [];

  return {
    strategies: publicStrategies,
    myStrategies,
    publishStrategy,
    deleteStrategy,
    updateStrategy,
    refresh,
  };
}
