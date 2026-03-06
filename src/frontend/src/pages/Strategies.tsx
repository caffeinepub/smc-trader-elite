import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  BookMarked,
  ChevronRight,
  Edit2,
  Globe,
  Lock,
  Plus,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TradeResult } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllTrades, useProfile } from "../hooks/useQueries";
import { type Strategy, useStrategies } from "../hooks/useStrategies";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ALL_TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"];

function winRateBadgeStyle(rate: number) {
  if (rate >= 60)
    return {
      bg: "oklch(0.74 0.2 145 / 0.12)",
      text: "oklch(0.74 0.2 145)",
      border: "oklch(0.74 0.2 145 / 0.3)",
    };
  if (rate >= 40)
    return {
      bg: "oklch(0.78 0.14 60 / 0.12)",
      text: "oklch(0.78 0.14 60)",
      border: "oklch(0.78 0.14 60 / 0.3)",
    };
  return {
    bg: "oklch(0.62 0.22 22 / 0.12)",
    text: "oklch(0.62 0.22 22)",
    border: "oklch(0.62 0.22 22 / 0.3)",
  };
}

function authorInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function monthsAgo(ts: number) {
  const diff = Date.now() - ts;
  const months = diff / (1000 * 60 * 60 * 24 * 30);
  return Math.floor(months);
}

// ─── Strategy Card ────────────────────────────────────────────────────────────

function StrategyCard({
  strategy,
  onView,
  onEdit,
  onDelete,
  isOwn = false,
  index,
}: {
  strategy: Strategy;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwn?: boolean;
  index: number;
}) {
  const colors = winRateBadgeStyle(strategy.winRate);
  const markerIdx = index + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.05, 0.25) }}
      data-ocid={markerIdx <= 3 ? `strategies.item.${markerIdx}` : undefined}
      className="glass-card rounded-2xl p-4 space-y-3 hover:border-win/20 transition-all"
    >
      {/* Author row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-display font-bold shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.18 220 / 0.8) 0%, oklch(0.55 0.15 260 / 0.6) 100%)",
              color: "oklch(0.97 0 0)",
            }}
          >
            {authorInitials(strategy.authorName)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-body font-medium text-muted-foreground truncate">
              {strategy.authorName}
            </div>
            <div className="text-sm font-display font-bold text-foreground truncate">
              {strategy.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isOwn && (
            <Badge
              className="text-[10px] font-body px-2"
              style={{
                background: strategy.isPublic
                  ? "oklch(0.74 0.2 145 / 0.1)"
                  : "oklch(var(--muted) / 0.5)",
                color: strategy.isPublic
                  ? "oklch(0.74 0.2 145)"
                  : "oklch(var(--muted-foreground))",
                border: strategy.isPublic
                  ? "1px solid oklch(0.74 0.2 145 / 0.25)"
                  : "1px solid oklch(var(--border) / 0.5)",
              }}
            >
              {strategy.isPublic ? (
                <Globe className="w-2.5 h-2.5 mr-1" />
              ) : (
                <Lock className="w-2.5 h-2.5 mr-1" />
              )}
              {strategy.isPublic ? "Public" : "Private"}
            </Badge>
          )}
          <div
            className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
            style={{
              background: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
            }}
          >
            {strategy.winRate.toFixed(1)}% WR
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Trades", value: strategy.totalTrades.toString() },
          { label: "Avg RR", value: `${strategy.avgRR.toFixed(1)}R` },
          { label: "PF", value: strategy.profitFactor.toFixed(2) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg p-2 text-center"
            style={{
              background: "oklch(var(--muted) / 0.3)",
              border: "1px solid oklch(var(--border) / 0.3)",
            }}
          >
            <div className="text-[10px] text-muted-foreground font-body">
              {stat.label}
            </div>
            <div className="text-sm font-mono font-bold text-foreground">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Entry model snippet */}
      <p className="text-xs text-muted-foreground font-body line-clamp-2 leading-relaxed">
        {strategy.entryModelDescription}
      </p>

      {/* Timeframes */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {strategy.timeframes.slice(0, 5).map((tf) => (
          <span
            key={tf}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: "oklch(var(--accent) / 0.3)",
              border: "1px solid oklch(var(--border) / 0.3)",
              color: "oklch(var(--muted-foreground))",
            }}
          >
            {tf}
          </span>
        ))}
        {strategy.marketContext && (
          <span
            className="text-[10px] font-body px-2 py-0.5 rounded-full ml-auto"
            style={{
              background: "oklch(0.65 0.18 220 / 0.1)",
              color: "oklch(0.65 0.18 220)",
              border: "1px solid oklch(0.65 0.18 220 / 0.25)",
            }}
          >
            {strategy.marketContext.slice(0, 20)}
            {strategy.marketContext.length > 20 ? "…" : ""}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          data-ocid="strategies.view.button"
          onClick={onView}
          size="sm"
          className="flex-1 h-8 rounded-xl text-xs font-body font-semibold transition-all"
          style={{
            background: "oklch(var(--win) / 0.1)",
            color: "oklch(var(--win))",
            border: "1px solid oklch(var(--win) / 0.2)",
          }}
        >
          <ChevronRight className="w-3.5 h-3.5 mr-1" />
          View Details
        </Button>
        {isOwn && onEdit && (
          <Button
            type="button"
            data-ocid="strategies.edit.button"
            onClick={onEdit}
            size="sm"
            variant="ghost"
            className="h-8 px-2.5 rounded-xl text-muted-foreground/70 hover:text-foreground hover:bg-accent/30 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        )}
        {isOwn && onDelete && (
          <Button
            type="button"
            data-ocid="strategies.delete.button"
            onClick={onDelete}
            size="sm"
            variant="ghost"
            className="h-8 px-2.5 rounded-xl text-muted-foreground/70 hover:text-loss hover:bg-loss/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Strategy Detail Sheet ────────────────────────────────────────────────────

function StrategyDetailSheet({
  strategy,
  open,
  onClose,
}: {
  strategy: Strategy | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!strategy) return null;
  const colors = winRateBadgeStyle(strategy.winRate);
  const ageMonths = monthsAgo(strategy.createdAt);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        data-ocid="strategies.dialog"
        className="w-full sm:max-w-lg overflow-y-auto flex flex-col"
        style={{
          background: "oklch(var(--card) / 0.97)",
          backdropFilter: "blur(40px)",
          borderLeft: "1px solid oklch(var(--border) / 0.5)",
        }}
      >
        <SheetHeader className="shrink-0 pb-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.18 220 / 0.9) 0%, oklch(0.55 0.15 260 / 0.7) 100%)",
                color: "oklch(0.97 0 0)",
              }}
            >
              {authorInitials(strategy.authorName)}
            </div>
            <div>
              <SheetTitle className="text-foreground font-display text-base leading-tight">
                {strategy.name}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-xs font-body mt-0.5">
                by {strategy.authorName} · {ageMonths}m tracked data
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Win Rate",
                value: `${strategy.winRate.toFixed(1)}%`,
                highlight: true,
              },
              { label: "Total Trades", value: strategy.totalTrades.toString() },
              { label: "Avg RR", value: `${strategy.avgRR.toFixed(1)}R` },
              {
                label: "Profit Factor",
                value: strategy.profitFactor.toFixed(2),
              },
              { label: "Timeframes", value: strategy.timeframes.join(", ") },
              { label: "Age", value: `${ageMonths}m` },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 space-y-0.5"
                style={{
                  background: s.highlight
                    ? colors.bg
                    : "oklch(var(--muted) / 0.3)",
                  border: `1px solid ${s.highlight ? colors.border : "oklch(var(--border) / 0.3)"}`,
                }}
              >
                <div className="text-[10px] text-muted-foreground font-body">
                  {s.label}
                </div>
                <div
                  className="text-sm font-mono font-bold"
                  style={{
                    color: s.highlight
                      ? colors.text
                      : "oklch(var(--foreground))",
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Entry Model */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "oklch(var(--muted) / 0.25)",
              border: "1px solid oklch(var(--border) / 0.3)",
            }}
          >
            <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Entry Model
            </h4>
            <p className="text-sm text-foreground font-body leading-relaxed">
              {strategy.entryModelDescription}
            </p>
          </div>

          {/* Market Context */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "oklch(var(--muted) / 0.25)",
              border: "1px solid oklch(var(--border) / 0.3)",
            }}
          >
            <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Market Context
            </h4>
            <p className="text-sm text-foreground font-body leading-relaxed">
              {strategy.marketContext}
            </p>
          </div>

          {/* Trade Summary */}
          {strategy.tradesSummary && (
            <div
              className="rounded-xl p-4"
              style={{
                background: "oklch(var(--muted) / 0.25)",
                border: "1px solid oklch(var(--border) / 0.3)",
              }}
            >
              <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Trade Summary & Notes
              </h4>
              <p className="text-sm text-foreground font-body leading-relaxed">
                {strategy.tradesSummary}
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 pt-4 border-t border-border/30">
          <Button
            data-ocid="strategies.close.button"
            onClick={onClose}
            variant="ghost"
            className="w-full h-10 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Publish Form ─────────────────────────────────────────────────────────────

const defaultForm = {
  name: "",
  entryModelDescription: "",
  marketContext: "",
  tradesSummary: "",
  timeframes: [] as string[],
  isPublic: true,
};

function PublishForm({
  onPublish,
  winRate,
  avgRR,
  totalTrades,
  profitFactor,
  authorId,
  authorName,
}: {
  onPublish: () => void;
  winRate: number;
  avgRR: number;
  totalTrades: number;
  profitFactor: number;
  authorId: string;
  authorName: string;
}) {
  const { publishStrategy } = useStrategies(authorId);
  const [form, setForm] = useState(defaultForm);

  const toggleTf = (tf: string) => {
    setForm((p) => ({
      ...p,
      timeframes: p.timeframes.includes(tf)
        ? p.timeframes.filter((t) => t !== tf)
        : [...p.timeframes, tf],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Strategy name is required");
      return;
    }
    if (!form.entryModelDescription.trim()) {
      toast.error("Entry model description is required");
      return;
    }
    if (form.timeframes.length === 0) {
      toast.error("Select at least one timeframe");
      return;
    }

    publishStrategy({
      authorId,
      authorName,
      name: form.name.trim(),
      entryModelDescription: form.entryModelDescription.trim(),
      marketContext: form.marketContext.trim(),
      timeframes: form.timeframes,
      isPublic: form.isPublic,
      totalTrades,
      winRate,
      avgRR,
      profitFactor,
      tradesSummary: form.tradesSummary.trim(),
    });

    toast.success("Strategy published!");
    setForm(defaultForm);
    onPublish();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      data-ocid="strategies.publish.form"
    >
      {/* Auto-fill stats banner */}
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{
          background: "oklch(0.74 0.2 145 / 0.07)",
          border: "1px solid oklch(0.74 0.2 145 / 0.2)",
        }}
      >
        <TrendingUp className="w-4 h-4 text-win shrink-0" />
        <div className="text-xs font-body text-muted-foreground">
          Auto-filled from your trade data:{" "}
          <span className="text-win font-semibold">
            {winRate.toFixed(1)}% WR
          </span>
          {" · "}
          <span className="text-foreground font-semibold">
            {totalTrades} trades
          </span>
          {" · "}
          <span className="text-foreground font-semibold">
            {avgRR.toFixed(1)}R avg
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-body uppercase tracking-wider">
          Strategy Name <span className="text-loss">*</span>
        </Label>
        <Input
          data-ocid="strategies.name.input"
          placeholder="e.g. London OB Sniper"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="h-11 rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-body uppercase tracking-wider">
          Entry Model Description <span className="text-loss">*</span>
        </Label>
        <Textarea
          data-ocid="strategies.entry_model.textarea"
          placeholder="Describe your entry model in detail..."
          value={form.entryModelDescription}
          onChange={(e) =>
            setForm((p) => ({ ...p, entryModelDescription: e.target.value }))
          }
          rows={4}
          className="rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-body uppercase tracking-wider">
          Market Context
        </Label>
        <Textarea
          data-ocid="strategies.market_context.textarea"
          placeholder="When does this strategy work best?"
          value={form.marketContext}
          onChange={(e) =>
            setForm((p) => ({ ...p, marketContext: e.target.value }))
          }
          rows={3}
          className="rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-body uppercase tracking-wider">
          Trade Summary Notes
        </Label>
        <Textarea
          data-ocid="strategies.summary.textarea"
          placeholder="Additional notes about this strategy..."
          value={form.tradesSummary}
          onChange={(e) =>
            setForm((p) => ({ ...p, tradesSummary: e.target.value }))
          }
          rows={3}
          className="rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground font-body uppercase tracking-wider">
          Timeframes Used <span className="text-loss">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {ALL_TIMEFRAMES.map((tf) => {
            const active = form.timeframes.includes(tf);
            return (
              <button
                key={tf}
                type="button"
                data-ocid="strategies.timeframe.toggle"
                onClick={() => toggleTf(tf)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
                style={{
                  background: active
                    ? "oklch(var(--win) / 0.12)"
                    : "oklch(var(--muted) / 0.4)",
                  color: active
                    ? "oklch(var(--win))"
                    : "oklch(var(--muted-foreground))",
                  border: active
                    ? "1px solid oklch(var(--win) / 0.3)"
                    : "1px solid oklch(var(--border) / 0.4)",
                }}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30">
        <div>
          <div className="text-sm font-body font-medium text-foreground">
            Make Public
          </div>
          <div className="text-xs text-muted-foreground font-body">
            Other traders can discover and view your strategy
          </div>
        </div>
        <Switch
          data-ocid="strategies.public.switch"
          checked={form.isPublic}
          onCheckedChange={(v) => setForm((p) => ({ ...p, isPublic: v }))}
        />
      </div>

      <Button
        type="submit"
        data-ocid="strategies.publish.button"
        className="w-full h-11 rounded-xl font-display font-semibold text-sm"
        style={{
          background:
            "linear-gradient(135deg, oklch(var(--win)) 0%, oklch(var(--win) / 0.7) 100%)",
          color: "oklch(0.1 0.008 255)",
          border: "none",
        }}
      >
        <Star className="w-4 h-4 mr-2" />
        Publish Strategy
      </Button>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Strategies() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useProfile();
  const { data: allTrades } = useAllTrades();

  const principalId = identity?.getPrincipal().toString() ?? "";
  const authorName = profile?.displayName ?? "Anonymous";

  const { strategies, myStrategies, deleteStrategy } =
    useStrategies(principalId);

  const [viewStrategy, setViewStrategy] = useState<Strategy | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterMinWR, setFilterMinWR] = useState(0);
  const [filterTF, setFilterTF] = useState<string>("");
  const [showPublishForm, setShowPublishForm] = useState(false);

  // Check eligibility: at least 1 trade that is >3 months old
  const oldestTrade = allTrades?.length
    ? Math.min(...allTrades.map((t) => new Date(t.date).getTime()))
    : null;
  const isEligible =
    oldestTrade !== null &&
    Date.now() - oldestTrade >= 90 * 24 * 60 * 60 * 1000;

  // Compute stats from trades
  const totalTrades = allTrades?.length ?? 0;
  const wins =
    allTrades?.filter((t) => t.result === TradeResult.win).length ?? 0;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const avgRR =
    totalTrades > 0
      ? (allTrades ?? []).reduce((sum, t) => sum + t.rrAchieved, 0) /
        totalTrades
      : 0;
  const profitFactor =
    wins > 0 && totalTrades - wins > 0
      ? (wins * avgRR) / (totalTrades - wins)
      : wins > 0
        ? wins * avgRR
        : 0;

  const filteredStrategies = strategies.filter((s) => {
    if (s.winRate < filterMinWR) return false;
    if (filterTF && !s.timeframes.includes(filterTF)) return false;
    return true;
  });

  const openDetail = (s: Strategy) => {
    setViewStrategy(s);
    setDetailOpen(true);
  };

  return (
    <section
      data-ocid="strategies.section"
      className="p-4 md:p-6 space-y-6 max-w-3xl animate-fade-in"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.74 0.2 145 / 0.8) 0%, oklch(0.55 0.15 145 / 0.6) 100%)",
            }}
          >
            <Star className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
              Strategy Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-body">
              Discover and share proven SMC trading strategies
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="discover" className="w-full">
        <TabsList
          className="w-full grid grid-cols-2 rounded-xl h-10 mb-1"
          style={{
            background: "oklch(var(--muted) / 0.4)",
            border: "1px solid oklch(var(--border) / 0.4)",
          }}
        >
          <TabsTrigger
            value="discover"
            data-ocid="strategies.discover.tab"
            className="rounded-lg text-sm font-body font-medium data-[state=active]:bg-win data-[state=active]:text-background transition-all"
          >
            <Globe className="w-3.5 h-3.5 mr-2" />
            Discover
          </TabsTrigger>
          <TabsTrigger
            value="mine"
            data-ocid="strategies.my_strategies.tab"
            className="rounded-lg text-sm font-body font-medium data-[state=active]:bg-win data-[state=active]:text-background transition-all"
          >
            <BookMarked className="w-3.5 h-3.5 mr-2" />
            My Strategies
          </TabsTrigger>
        </TabsList>

        {/* ── Discover Tab ── */}
        <TabsContent value="discover" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <Label className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-2 block">
                  Min Win Rate: {filterMinWR}%
                </Label>
                <Slider
                  min={0}
                  max={80}
                  step={5}
                  value={[filterMinWR]}
                  onValueChange={([v]) => setFilterMinWR(v)}
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider w-full">
                  Timeframe
                </span>
                {["", ...ALL_TIMEFRAMES.slice(0, 6)].map((tf) => (
                  <button
                    key={tf || "all"}
                    type="button"
                    onClick={() => setFilterTF(tf)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all"
                    style={{
                      background:
                        filterTF === tf
                          ? "oklch(var(--win) / 0.12)"
                          : "oklch(var(--muted) / 0.4)",
                      color:
                        filterTF === tf
                          ? "oklch(var(--win))"
                          : "oklch(var(--muted-foreground))",
                      border:
                        filterTF === tf
                          ? "1px solid oklch(var(--win) / 0.3)"
                          : "1px solid oklch(var(--border) / 0.3)",
                    }}
                  >
                    {tf || "All"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Strategy grid */}
          <AnimatePresence mode="popLayout">
            {filteredStrategies.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-ocid="strategies.empty_state"
                className="glass-card rounded-2xl p-12 text-center"
              >
                <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">
                  No strategies match your filters
                </p>
                <p className="text-xs text-muted-foreground/60 font-body mt-1">
                  Try adjusting the win rate or timeframe filter
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStrategies.map((s, i) => (
                  <StrategyCard
                    key={s.id}
                    strategy={s}
                    index={i}
                    onView={() => openDetail(s)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ── My Strategies Tab ── */}
        <TabsContent value="mine" className="mt-4 space-y-4">
          {/* Eligibility banner */}
          {!isEligible && (
            <div
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{
                background: "oklch(0.78 0.14 60 / 0.08)",
                border: "1px solid oklch(0.78 0.14 60 / 0.25)",
              }}
            >
              <AlertCircle className="w-5 h-5 text-be shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-display font-semibold text-foreground">
                  3 Months Required
                </div>
                <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
                  Share your strategy after 3 months of tracked data with a
                  profitable record. Keep journaling your trades to unlock
                  strategy sharing.
                </p>
              </div>
            </div>
          )}

          {/* Publish button */}
          {isEligible && (
            <Button
              type="button"
              data-ocid="strategies.publish.open_modal_button"
              onClick={() => setShowPublishForm((v) => !v)}
              className="w-full h-11 rounded-xl font-display font-semibold text-sm gap-2"
              style={{
                background: showPublishForm
                  ? "oklch(var(--muted) / 0.5)"
                  : "linear-gradient(135deg, oklch(var(--win)) 0%, oklch(var(--win) / 0.7) 100%)",
                color: showPublishForm
                  ? "oklch(var(--foreground))"
                  : "oklch(0.1 0.008 255)",
                border: "none",
              }}
            >
              <Plus className="w-4 h-4" />
              {showPublishForm ? "Hide Form" : "Publish New Strategy"}
            </Button>
          )}

          {/* Publish form */}
          <AnimatePresence>
            {showPublishForm && isEligible && (
              <motion.div
                key="publish-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-display font-semibold text-foreground mb-4">
                    Publish Strategy
                  </h3>
                  <PublishForm
                    onPublish={() => setShowPublishForm(false)}
                    winRate={winRate}
                    avgRR={avgRR}
                    totalTrades={totalTrades}
                    profitFactor={profitFactor}
                    authorId={principalId}
                    authorName={authorName}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* My strategies list */}
          {myStrategies.length === 0 ? (
            <div
              data-ocid="strategies.my.empty_state"
              className="glass-card rounded-2xl p-10 text-center"
            >
              <BookMarked className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-body">
                No published strategies yet
              </p>
              <p className="text-xs text-muted-foreground/60 font-body mt-1">
                {isEligible
                  ? "Use the button above to publish your first strategy"
                  : "Track 3+ months of trades to unlock sharing"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myStrategies.map((s, i) => (
                <StrategyCard
                  key={s.id}
                  strategy={s}
                  index={i}
                  isOwn
                  onView={() => openDetail(s)}
                  onDelete={() => {
                    deleteStrategy(s.id);
                    toast.success("Strategy deleted");
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <StrategyDetailSheet
        strategy={viewStrategy}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setViewStrategy(null);
        }}
      />
    </section>
  );
}
