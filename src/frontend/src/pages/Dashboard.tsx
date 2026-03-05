import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Award,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import type { Easing } from "motion/react";
import EquityCurveChart from "../components/EquityCurveChart";
import {
  useAllTrades,
  useAverageRR,
  useCountTradeResults,
  useWinRate,
} from "../hooks/useQueries";

const easeOut: Easing = "easeOut";
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: easeOut },
});

export default function Dashboard() {
  const { data: trades, isLoading: tradesLoading } = useAllTrades();
  const { data: winRate, isLoading: winRateLoading } = useWinRate();
  const { data: avgRR, isLoading: avgRRLoading } = useAverageRR();
  const { data: counts, isLoading: countsLoading } = useCountTradeResults();

  const isLoading =
    tradesLoading || winRateLoading || avgRRLoading || countsLoading;

  const totalTrades = counts ? Number(counts[0]) : 0;
  const wins = counts ? Number(counts[1]) : 0;
  const losses = counts ? Number(counts[2]) : 0;

  const stats = [
    {
      label: "Total Trades",
      value: isLoading ? "—" : totalTrades.toString(),
      icon: Activity,
      color: "text-foreground",
      bg: "from-muted/60 to-muted/20",
    },
    {
      label: "Wins",
      value: isLoading ? "—" : wins.toString(),
      icon: TrendingUp,
      color: "win-text",
      bg: "from-win/10 to-win/5",
    },
    {
      label: "Losses",
      value: isLoading ? "—" : losses.toString(),
      icon: TrendingDown,
      color: "loss-text",
      bg: "from-loss/10 to-loss/5",
    },
    {
      label: "Win Rate",
      value: isLoading ? "—" : `${(winRate ?? 0).toFixed(1)}%`,
      icon: Target,
      color: (winRate ?? 0) >= 50 ? "win-text" : "loss-text",
      bg:
        (winRate ?? 0) >= 50
          ? "from-win/10 to-win/5"
          : "from-loss/10 to-loss/5",
    },
    {
      label: "Avg R:R",
      value: isLoading ? "—" : `${(avgRR ?? 0).toFixed(2)}R`,
      icon: Award,
      color: (avgRR ?? 0) >= 1 ? "win-text" : "loss-text",
      bg: (avgRR ?? 0) >= 1 ? "from-win/10 to-win/5" : "from-loss/10 to-loss/5",
    },
  ];

  return (
    <section
      data-ocid="dashboard.section"
      className="p-4 md:p-6 space-y-6 animate-fade-in"
    >
      {/* Page Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Your trading performance at a glance
        </p>
      </motion.div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              {...fadeUp(i * 0.06)}
              className={`stat-card rounded-2xl p-4 bg-gradient-to-br ${stat.bg}`}
            >
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton
                    className="h-4 w-16"
                    data-ocid="dashboard.loading_state"
                  />
                  <Skeleton className="h-7 w-12" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-background/30">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-display font-bold tracking-tight ${stat.color}`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-body">
                    {stat.label}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Equity Curve */}
      <motion.div {...fadeUp(0.3)} className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-display font-semibold text-foreground">
              Equity Curve
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              Cumulative R:R over trades
            </p>
          </div>
          {trades && trades.length > 0 && (
            <span
              className={`text-xs font-mono px-2 py-1 rounded-lg ${
                (trades.reduce((acc, t) => acc + t.rrAchieved, 0)) >= 0
                  ? "win-badge"
                  : "loss-badge"
              }`}
            >
              Total:{" "}
              {trades.reduce((acc, t) => acc + t.rrAchieved, 0).toFixed(2)}R
            </span>
          )}
        </div>

        {tradesLoading ? (
          <div data-ocid="dashboard.loading_state">
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : !trades || trades.length === 0 ? (
          <div
            data-ocid="dashboard.empty_state"
            className="h-48 flex flex-col items-center justify-center text-center"
          >
            <Activity className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No trades yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Log your first trade to see your equity curve
            </p>
          </div>
        ) : (
          <EquityCurveChart trades={trades} />
        )}
      </motion.div>

      {/* Recent Trades Preview */}
      {trades && trades.length > 0 && (
        <motion.div {...fadeUp(0.4)} className="glass-card rounded-2xl p-5">
          <h2 className="text-base font-display font-semibold text-foreground mb-4">
            Recent Trades
          </h2>
          <div className="space-y-2">
            {[...trades]
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .slice(0, 5)
              .map((trade) => (
                <div
                  key={trade.id.toString()}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        trade.result === "win"
                          ? "bg-win"
                          : trade.result === "loss"
                            ? "bg-loss"
                            : "bg-be"
                      }`}
                    />
                    <span className="text-sm font-mono font-medium text-foreground">
                      {trade.pair}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-md font-body ${
                        trade.tradeType === "buy"
                          ? "bg-win/10 text-win"
                          : "bg-loss/10 text-loss"
                      }`}
                    >
                      {trade.tradeType.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-mono font-semibold ${
                        trade.rrAchieved >= 0 ? "text-win" : "text-loss"
                      }`}
                    >
                      {trade.rrAchieved >= 0 ? "+" : ""}
                      {trade.rrAchieved.toFixed(2)}R
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      {trade.date}
                    </span>
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
