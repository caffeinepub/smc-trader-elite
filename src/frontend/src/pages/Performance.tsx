import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  BarChart3,
  CheckCircle,
  Flame,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import type { Easing } from "motion/react";
import EquityCurveChart from "../components/EquityCurveChart";
import {
  useAllTrades,
  useAverageRR,
  useLongestLossStreak,
  useLongestWinStreak,
  useLosingPairs,
  useWinRate,
  useWinningPairs,
} from "../hooks/useQueries";

const easeOut: Easing = "easeOut";
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: easeOut },
});

export default function Performance() {
  const { data: trades, isLoading: tradesLoading } = useAllTrades();
  const { data: winRate, isLoading: winRateLoading } = useWinRate();
  const { data: avgRR, isLoading: avgRRLoading } = useAverageRR();
  const { data: winStreak, isLoading: winStreakLoading } =
    useLongestWinStreak();
  const { data: lossStreak, isLoading: lossStreakLoading } =
    useLongestLossStreak();
  const { data: winningPairs, isLoading: winPairsLoading } = useWinningPairs();
  const { data: losingPairs, isLoading: losePairsLoading } = useLosingPairs();

  const isLoading =
    tradesLoading ||
    winRateLoading ||
    avgRRLoading ||
    winStreakLoading ||
    lossStreakLoading;

  const totalTrades = trades?.length ?? 0;
  const totalRR = trades?.reduce((acc, t) => acc + t.rrAchieved, 0) ?? 0;
  const wins = trades?.filter((t) => t.result === "win").length ?? 0;
  const losses = trades?.filter((t) => t.result === "loss").length ?? 0;

  // Profit factor = total wins RR / total losses RR (absolute)
  const totalWinsRR =
    trades
      ?.filter((t) => t.result === "win")
      .reduce((a, t) => a + t.rrAchieved, 0) ?? 0;
  const totalLossesRR = Math.abs(
    trades
      ?.filter((t) => t.result === "loss")
      .reduce((a, t) => a + t.rrAchieved, 0) ?? 0,
  );
  const profitFactor =
    totalLossesRR > 0 ? totalWinsRR / totalLossesRR : totalWinsRR > 0 ? 999 : 0;

  const metricCards = [
    {
      label: "Win Rate",
      value: isLoading ? "—" : `${(winRate ?? 0).toFixed(1)}%`,
      icon: Target,
      color: (winRate ?? 0) >= 50 ? "win-text" : "loss-text",
      sub: `${wins}W / ${losses}L`,
    },
    {
      label: "Avg R:R",
      value: isLoading ? "—" : `${(avgRR ?? 0).toFixed(2)}R`,
      icon: Award,
      color: (avgRR ?? 0) >= 1 ? "win-text" : "loss-text",
      sub: `${totalTrades} total trades`,
    },
    {
      label: "Total P&L",
      value: isLoading
        ? "—"
        : `${totalRR >= 0 ? "+" : ""}${totalRR.toFixed(2)}R`,
      icon: totalRR >= 0 ? TrendingUp : TrendingDown,
      color: totalRR >= 0 ? "win-text" : "loss-text",
      sub: "cumulative R",
    },
    {
      label: "Profit Factor",
      value: isLoading
        ? "—"
        : profitFactor >= 999
          ? "∞"
          : profitFactor.toFixed(2),
      icon: BarChart3,
      color:
        profitFactor >= 1.5
          ? "win-text"
          : profitFactor >= 1
            ? "text-be"
            : "loss-text",
      sub: "gross profit / loss",
    },
  ];

  return (
    <section
      data-ocid="performance.section"
      className="p-4 md:p-6 space-y-6 animate-fade-in"
    >
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          Performance
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Deep analytics on your trading edge
        </p>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              {...fadeUp(i * 0.06)}
              className="stat-card rounded-2xl p-4"
            >
              {isLoading ? (
                <div
                  className="space-y-2"
                  data-ocid="performance.loading_state"
                >
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-7 w-14" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-background/30">
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-display font-bold tracking-tight ${card.color}`}
                  >
                    {card.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-body">
                    {card.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground/50 mt-0.5 font-body">
                    {card.sub}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Equity Curve */}
      <motion.div {...fadeUp(0.28)} className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-display font-semibold text-foreground">
              Equity Curve
            </h2>
            <p className="text-xs text-muted-foreground font-body">
              Cumulative R:R performance
            </p>
          </div>
        </div>
        {tradesLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : !trades || trades.length === 0 ? (
          <div
            data-ocid="performance.empty_state"
            className="h-48 flex flex-col items-center justify-center text-center"
          >
            <BarChart3 className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              No trades to analyze
            </p>
          </div>
        ) : (
          <EquityCurveChart trades={trades} height={220} />
        )}
      </motion.div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div {...fadeUp(0.35)} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-win/10">
              <Flame className="w-4 h-4 text-win" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-body">
                Best Win Streak
              </div>
            </div>
          </div>
          {winStreakLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="text-3xl font-display font-bold text-win">
              {winStreak?.toString() ?? "0"}
            </div>
          )}
          <div className="text-xs text-muted-foreground/60 mt-1 font-body">
            consecutive wins
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.4)} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-loss/10">
              <TrendingDown className="w-4 h-4 text-loss" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-body">
                Worst Loss Streak
              </div>
            </div>
          </div>
          {lossStreakLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="text-3xl font-display font-bold text-loss">
              {lossStreak?.toString() ?? "0"}
            </div>
          )}
          <div className="text-xs text-muted-foreground/60 mt-1 font-body">
            consecutive losses
          </div>
        </motion.div>
      </div>

      {/* Best & Worst Pairs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best Pairs */}
        <motion.div {...fadeUp(0.45)} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-win" />
            <h3 className="text-sm font-display font-semibold text-foreground">
              Best Pairs
            </h3>
          </div>
          {winPairsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 rounded-lg" />
              ))}
            </div>
          ) : !winningPairs || winningPairs.length === 0 ? (
            <div
              data-ocid="performance.empty_state"
              className="text-sm text-muted-foreground/60 font-body py-4 text-center"
            >
              No winning pairs yet
            </div>
          ) : (
            <div className="space-y-2">
              {winningPairs.slice(0, 5).map((pair, i) => (
                <div key={pair} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground/40">
                      #{i + 1}
                    </span>
                    <span className="font-mono font-semibold text-foreground text-sm">
                      {pair}
                    </span>
                  </div>
                  <span className="win-badge text-[10px] font-body px-2 py-0.5 rounded-full">
                    Winning
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Worst Pairs */}
        <motion.div {...fadeUp(0.5)} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-4 h-4 text-loss" />
            <h3 className="text-sm font-display font-semibold text-foreground">
              Worst Pairs
            </h3>
          </div>
          {losePairsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 rounded-lg" />
              ))}
            </div>
          ) : !losingPairs || losingPairs.length === 0 ? (
            <div
              data-ocid="performance.empty_state"
              className="text-sm text-muted-foreground/60 font-body py-4 text-center"
            >
              No losing pairs yet
            </div>
          ) : (
            <div className="space-y-2">
              {losingPairs.slice(0, 5).map((pair, i) => (
                <div key={pair} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground/40">
                      #{i + 1}
                    </span>
                    <span className="font-mono font-semibold text-foreground text-sm">
                      {pair}
                    </span>
                  </div>
                  <span className="loss-badge text-[10px] font-body px-2 py-0.5 rounded-full">
                    Losing
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Win Rate Breakdown */}
      {trades && trades.length > 0 && (
        <motion.div {...fadeUp(0.55)} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-display font-semibold text-foreground mb-4">
            Trade Breakdown
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Wins",
                count: wins,
                total: totalTrades,
                color: "bg-win",
              },
              {
                label: "Losses",
                count: losses,
                total: totalTrades,
                color: "bg-loss",
              },
              {
                label: "Break Even",
                count: totalTrades - wins - losses,
                total: totalTrades,
                color: "bg-be",
              },
            ].map(({ label, count, total, color }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-body">
                    {label}
                  </span>
                  <span className="font-mono text-foreground">
                    {count} (
                    {total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: total > 0 ? `${(count / total) * 100}%` : "0%",
                    }}
                    transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground/40 font-body py-2">
        © {new Date().getFullYear()} — Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-win/50 hover:text-win transition-colors"
        >
          caffeine.ai
        </a>
      </div>
    </section>
  );
}
