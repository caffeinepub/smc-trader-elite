import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  History,
  Minus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TradeResult } from "../backend.d";
import type { Trade } from "../backend.d";
import { useAllTrades, useDeleteTrade } from "../hooks/useQueries";

type FilterTab = "all" | TradeResult;

const RESULT_CONFIG = {
  [TradeResult.win]: {
    label: "Win",
    badge: "win-badge",
    icon: TrendingUp,
    iconClass: "text-win",
  },
  [TradeResult.loss]: {
    label: "Loss",
    badge: "loss-badge",
    icon: TrendingDown,
    iconClass: "text-loss",
  },
  [TradeResult.be]: {
    label: "BE",
    badge: "be-badge",
    icon: Minus,
    iconClass: "text-be",
  },
};

export default function TradeHistory() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const { data: trades, isLoading } = useAllTrades();
  const deleteTrade = useDeleteTrade();

  const handleDelete = async (trade: Trade) => {
    setDeletingId(trade.id);
    try {
      await deleteTrade.mutateAsync(trade.id);
      toast.success(`Trade deleted — ${trade.pair}`);
    } catch {
      toast.error("Failed to delete trade");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = (trades ?? [])
    .filter((t) => {
      const matchesFilter = filter === "all" || t.result === filter;
      const matchesSearch =
        !search || t.pair.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="p-4 md:p-6 space-y-5 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          Trade History
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Review and manage your logged trades
        </p>
      </motion.div>

      {/* Filter Tabs & Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterTab)}
          className="flex-1"
        >
          <TabsList
            data-ocid="history.filter.tab"
            className="bg-secondary/50 border border-border/40 p-1 h-auto rounded-xl"
          >
            <TabsTrigger
              value="all"
              className="text-xs font-body rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground"
            >
              All {trades && `(${trades.length})`}
            </TabsTrigger>
            <TabsTrigger
              value={TradeResult.win}
              className="text-xs font-body rounded-lg data-[state=active]:bg-win/15 data-[state=active]:text-win"
            >
              Wins{" "}
              {trades &&
                `(${trades.filter((t) => t.result === TradeResult.win).length})`}
            </TabsTrigger>
            <TabsTrigger
              value={TradeResult.loss}
              className="text-xs font-body rounded-lg data-[state=active]:bg-loss/15 data-[state=active]:text-loss"
            >
              Losses{" "}
              {trades &&
                `(${trades.filter((t) => t.result === TradeResult.loss).length})`}
            </TabsTrigger>
            <TabsTrigger
              value={TradeResult.be}
              className="text-xs font-body rounded-lg data-[state=active]:bg-be/15 data-[state=active]:text-be"
            >
              BE{" "}
              {trades &&
                `(${trades.filter((t) => t.result === TradeResult.be).length})`}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative sm:w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input
            data-ocid="history.search_input"
            placeholder="Search pair..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-input/50 border-border/50 text-sm font-mono h-9 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Trade List */}
      <div data-ocid="history.list">
        {isLoading ? (
          <div className="space-y-3" data-ocid="history.loading_state">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="history.empty_state"
            className="glass-card rounded-2xl p-12 text-center"
          >
            <History className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-body text-muted-foreground">
              {search
                ? `No trades matching "${search}"`
                : "No trades in this category"}
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              {!search && filter === "all"
                ? "Log your first trade in the Journal tab"
                : ""}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2.5">
              {filtered.map((trade, idx) => {
                const resultCfg = RESULT_CONFIG[trade.result as TradeResult];
                const ResultIcon = resultCfg?.icon ?? Minus;
                const isDeleting = deletingId === trade.id;
                // Use positional index for marker (max 3 shown)
                const markerIdx = idx + 1;

                return (
                  <motion.div
                    key={trade.id.toString()}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, x: -8 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                    data-ocid={
                      markerIdx <= 3 ? `history.item.${markerIdx}` : undefined
                    }
                    className="glass-card rounded-2xl p-4 hover:border-border/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Trade Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            trade.result === TradeResult.win
                              ? "bg-win/10"
                              : trade.result === TradeResult.loss
                                ? "bg-loss/10"
                                : "bg-be/10"
                          }`}
                        >
                          <ResultIcon
                            className={`w-4 h-4 ${resultCfg?.iconClass ?? "text-be"}`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-foreground text-sm">
                              {trade.pair}
                            </span>
                            <span
                              className={`text-[10px] font-body px-1.5 py-0.5 rounded-md ${
                                trade.tradeType === "buy"
                                  ? "bg-win/10 text-win"
                                  : "bg-loss/10 text-loss"
                              }`}
                            >
                              {trade.tradeType.toUpperCase()}
                            </span>
                            {resultCfg && (
                              <span
                                className={`text-[10px] font-body px-1.5 py-0.5 rounded-full ${resultCfg.badge}`}
                              >
                                {resultCfg.label}
                              </span>
                            )}
                            {trade.entryTimeframe && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30">
                                {trade.entryTimeframe}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground/70 font-body">
                              {trade.date}
                            </span>
                            {trade.tradeTime && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground/60 font-mono">
                                <Clock className="w-3 h-3 text-muted-foreground/40" />
                                {trade.tradeTime}
                              </span>
                            )}
                            {trade.notes && (
                              <span className="text-[10px] text-muted-foreground/50 font-body truncate max-w-32">
                                {trade.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: RR + Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div
                            className={`text-base font-mono font-bold ${
                              trade.rrAchieved >= 0 ? "text-win" : "text-loss"
                            }`}
                          >
                            {trade.rrAchieved >= 0 ? "+" : ""}
                            {trade.rrAchieved.toFixed(2)}R
                          </div>
                          <div className="text-[10px] text-muted-foreground/60 font-mono">
                            E:{trade.entryPrice.toFixed(5)}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          data-ocid={
                            markerIdx <= 3
                              ? `history.delete_button.${markerIdx}`
                              : undefined
                          }
                          onClick={() => handleDelete(trade)}
                          disabled={isDeleting || deleteTrade.isPending}
                          className="w-8 h-8 rounded-xl text-muted-foreground/40 hover:text-loss hover:bg-loss/10 transition-colors"
                        >
                          {isDeleting ? (
                            <div className="w-3 h-3 rounded-full border-2 border-loss border-t-transparent animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
