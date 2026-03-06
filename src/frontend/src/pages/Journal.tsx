import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BookMarked,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  Image,
  Layers,
  Loader2,
  Minus,
  PenLine,
  Trash2,
  TrendingDown,
  TrendingUp,
  Tv2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Trade } from "../backend.d";
import { TradeResult, TradeType } from "../backend.d";
import {
  useAllTrades,
  useCreateTrade,
  useDeleteTrade,
  useUpdateTrade,
} from "../hooks/useQueries";

// ─── Types ────────────────────────────────────────────────────────────────────

const TIMEFRAME_OPTIONS = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"];

const defaultForm = {
  date: new Date().toISOString().split("T")[0],
  pair: "",
  tradeType: "" as TradeType | "",
  entryPrice: "",
  stopLoss: "",
  takeProfit: "",
  rrAchieved: "",
  entryTimeframe: "",
  tradeTime: "",
  result: "" as TradeResult | "",
  emotion: "",
  notes: "",
};

type SheetMode = "view" | "edit";

const RESULT_CONFIG = {
  [TradeResult.win]: {
    label: "Win",
    badgeClass: "win-badge",
    icon: TrendingUp,
    iconClass: "text-win",
    bgClass: "bg-win/10",
  },
  [TradeResult.loss]: {
    label: "Loss",
    badgeClass: "loss-badge",
    icon: TrendingDown,
    iconClass: "text-loss",
    bgClass: "bg-loss/10",
  },
  [TradeResult.be]: {
    label: "BE",
    badgeClass: "be-badge",
    icon: Minus,
    iconClass: "text-be",
    bgClass: "bg-be/10",
  },
};

// ─── TV Badge ─────────────────────────────────────────────────────────────────

function TVBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-win/15 text-win border border-win/20 ml-1.5 leading-none">
      <Tv2 className="w-2.5 h-2.5" />
      TV
    </span>
  );
}

// ─── Read-only field row ──────────────────────────────────────────────────────

function ViewField({
  label,
  value,
  mono = false,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: "win" | "loss" | "be";
}) {
  const accentClass =
    accent === "win"
      ? "text-win"
      : accent === "loss"
        ? "text-loss"
        : accent === "be"
          ? "text-be"
          : "text-foreground";

  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border/30 last:border-0">
      <span className="text-xs font-body text-muted-foreground shrink-0 pt-0.5 w-36">
        {label}
      </span>
      <span
        className={`text-sm text-right ${mono ? "font-mono" : "font-body"} ${accentClass} flex-1`}
      >
        {value || <span className="text-muted-foreground/40 italic">—</span>}
      </span>
    </div>
  );
}

// ─── TradingView Setup Guide ──────────────────────────────────────────────────

function TVSetupGuide() {
  const [open, setOpen] = useState(false);
  const journalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}?tab=journal`
      : "https://yourapp.ic0.app?tab=journal";

  const alertTemplate =
    "{{ticker}} LONG entry={{close}} sl={{plot_0}} tp={{plot_1}} rr={{plot_2}} tf={{interval}} time={{timenow}}";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  const paramTable = [
    { param: "symbol", tv: "{{ticker}}", desc: "Instrument name" },
    { param: "entry", tv: "{{close}}", desc: "Entry price" },
    { param: "sl", tv: "{{plot_0}}", desc: "Stop loss price" },
    { param: "tp", tv: "{{plot_1}}", desc: "Take profit price" },
    { param: "rr", tv: "{{plot_2}}", desc: "Risk/reward ratio" },
    { param: "tf", tv: "{{interval}}", desc: "Chart timeframe" },
    { param: "time", tv: "{{timenow}}", desc: "Trade entry time" },
  ];

  const steps = [
    "Open TradingView and set up your trade levels",
    "Create an alert on your entry condition",
    'Set alert action to "Webhook URL"',
    "Paste your Journal URL as the webhook",
    "Use the message template above in the alert message",
    "When triggered, open SMC Trader Elite — your trade data will be pre-filled",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="glass-card rounded-2xl overflow-hidden border border-win/10"
      data-ocid="journal.tvguide.panel"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-ocid="journal.tvguide.toggle"
        className="w-full flex items-center justify-between p-4 hover:bg-win/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-win/10 flex items-center justify-center shrink-0">
            <Tv2 className="w-4 h-4 text-win" />
          </div>
          <div className="text-left">
            <p className="text-sm font-body font-semibold text-foreground">
              TradingView Alert Setup
            </p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              Auto-fill trades directly from TradingView alerts
            </p>
          </div>
        </div>
        <div className="text-muted-foreground/60 group-hover:text-foreground transition-colors">
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="guide-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 space-y-5 border-t border-border/30">
              {/* How it works */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3.5 h-3.5 text-win" />
                  <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider">
                    How it works
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Configure a TradingView alert to open this app's URL when you
                  enter a trade. The app will automatically pre-fill your trade
                  details — entry, SL, TP, RR, timeframe, and time — so you only
                  need to complete the manual fields.
                </p>
              </div>

              {/* Journal URL */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="w-3.5 h-3.5 text-win" />
                  <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider">
                    Your Journal URL
                  </h4>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 rounded-xl bg-input/30 border border-border/40 font-mono text-xs text-muted-foreground truncate select-all">
                    {journalUrl}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    data-ocid="journal.tvguide.url.button"
                    onClick={() => copyToClipboard(journalUrl, "Journal URL")}
                    className="h-9 w-9 rounded-xl bg-win/10 hover:bg-win/20 text-win border border-win/20 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Alert Message Template */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-3.5 h-3.5 text-win" />
                  <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider">
                    Alert Message Template
                  </h4>
                </div>
                <div className="relative rounded-xl bg-black/40 border border-border/30 overflow-hidden">
                  <pre className="p-3 text-xs font-mono text-win/80 leading-relaxed whitespace-pre-wrap break-all">
                    {alertTemplate}
                  </pre>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    data-ocid="journal.tvguide.template.button"
                    onClick={() =>
                      copyToClipboard(alertTemplate, "Alert template")
                    }
                    className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-win/10 hover:bg-win/20 text-win"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Parameter Reference Table */}
              <div>
                <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-2">
                  Parameter Reference
                </h4>
                <div className="rounded-xl overflow-hidden border border-border/30">
                  <table className="w-full text-xs font-body">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/30">
                        <th className="text-left px-3 py-2 text-muted-foreground font-semibold">
                          URL Param
                        </th>
                        <th className="text-left px-3 py-2 text-muted-foreground font-semibold">
                          TradingView Variable
                        </th>
                        <th className="text-left px-3 py-2 text-muted-foreground font-semibold hidden sm:table-cell">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paramTable.map((row, i) => (
                        <tr
                          key={row.param}
                          className={`border-b border-border/20 last:border-0 ${i % 2 === 0 ? "bg-transparent" : "bg-muted/10"}`}
                        >
                          <td className="px-3 py-2 font-mono text-win/70">
                            {row.param}
                          </td>
                          <td className="px-3 py-2 font-mono text-foreground/70">
                            {row.tv}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                            {row.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Step-by-step */}
              <div>
                <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3">
                  Step-by-step Instructions
                </h4>
                <ol className="space-y-2">
                  {steps.map((step, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-win/15 text-win text-[10px] font-bold flex items-center justify-center font-mono leading-none">
                        {i + 1}
                      </span>
                      <span className="text-xs font-body text-muted-foreground leading-relaxed pt-0.5">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Journal() {
  // ── New trade form state
  const [form, setForm] = useState(defaultForm);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── TradingView auto-fill state
  const [tvFilledFields, setTvFilledFields] = useState<Set<string>>(new Set());
  const [tvBannerVisible, setTvBannerVisible] = useState(false);
  const tvBannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sheet state
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("view");

  // ── Edit form state (within sheet)
  const [editForm, setEditForm] = useState<{
    date: string;
    pair: string;
    tradeType: TradeType | "";
    entryPrice: string;
    stopLoss: string;
    takeProfit: string;
    rrAchieved: string;
    entryTimeframe: string;
    tradeTime: string;
    result: TradeResult | "";
    emotion: string;
    notes: string;
  }>({
    date: "",
    pair: "",
    tradeType: "",
    entryPrice: "",
    stopLoss: "",
    takeProfit: "",
    rrAchieved: "",
    entryTimeframe: "",
    tradeTime: "",
    result: "",
    emotion: "",
    notes: "",
  });

  // ── Queries / Mutations
  const createTrade = useCreateTrade();
  const updateTrade = useUpdateTrade();
  const deleteTrade = useDeleteTrade();
  const { data: trades, isLoading: tradesLoading } = useAllTrades();

  // ── URL param auto-fill on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const symbol = params.get("symbol");
    const entry = params.get("entry");
    const sl = params.get("sl");
    const tp = params.get("tp");
    const rr = params.get("rr");
    const tf = params.get("tf");
    const time = params.get("time");

    const hasAny = [symbol, entry, sl, tp, rr, tf, time].some(Boolean);
    if (!hasAny) return;

    const filled = new Set<string>();
    setForm((prev) => {
      const next = { ...prev };
      if (symbol) {
        next.pair = symbol.toUpperCase();
        filled.add("pair");
      }
      if (entry) {
        next.entryPrice = entry;
        filled.add("entryPrice");
      }
      if (sl) {
        next.stopLoss = sl;
        filled.add("stopLoss");
      }
      if (tp) {
        next.takeProfit = tp;
        filled.add("takeProfit");
      }
      if (rr) {
        next.rrAchieved = rr;
        filled.add("rrAchieved");
      }
      if (tf && TIMEFRAME_OPTIONS.includes(tf.toUpperCase())) {
        next.entryTimeframe = tf.toUpperCase();
        filled.add("entryTimeframe");
      }
      if (time) {
        // normalize time to HH:MM
        const timeParts = time.replace(/[^0-9:]/g, "").slice(0, 5);
        next.tradeTime = timeParts;
        filled.add("tradeTime");
      }
      return next;
    });

    setTvFilledFields(filled);
    setTvBannerVisible(true);

    // Clear URL params without reload
    window.history.replaceState({}, "", window.location.pathname);

    // Auto-dismiss banner after 8 seconds
    tvBannerTimerRef.current = setTimeout(() => {
      setTvBannerVisible(false);
    }, 8000);

    return () => {
      if (tvBannerTimerRef.current) clearTimeout(tvBannerTimerRef.current);
    };
  }, []);

  // ── Screenshot handler
  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshot(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ── Create trade submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tradeType || !form.result) {
      toast.error("Please select trade type and result");
      return;
    }
    if (!form.pair.trim()) {
      toast.error("Please enter a pair");
      return;
    }
    try {
      await createTrade.mutateAsync({
        date: form.date,
        pair: form.pair,
        tradeType: form.tradeType as TradeType,
        entryPrice: Number.parseFloat(form.entryPrice) || 0,
        stopLoss: Number.parseFloat(form.stopLoss) || 0,
        takeProfit: Number.parseFloat(form.takeProfit) || 0,
        rrAchieved: Number.parseFloat(form.rrAchieved) || 0,
        result: form.result as TradeResult,
        emotion: form.emotion,
        notes: form.notes,
        screenshotFileId: null,
        entryTimeframe: form.entryTimeframe,
        tradeTime: form.tradeTime,
      });
      toast.success("Trade logged successfully");
      setForm({ ...defaultForm, date: new Date().toISOString().split("T")[0] });
      setScreenshot(null);
      setScreenshotName("");
      setTvFilledFields(new Set());
      setTvBannerVisible(false);
    } catch {
      toast.error("Failed to save trade");
    }
  };

  // ── Open sheet in view mode
  const openTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setSheetMode("view");
    setSheetOpen(true);
  };

  // ── Switch to edit mode
  const enterEditMode = () => {
    if (!selectedTrade) return;
    setEditForm({
      date: selectedTrade.date,
      pair: selectedTrade.pair,
      tradeType: selectedTrade.tradeType,
      entryPrice: String(selectedTrade.entryPrice),
      stopLoss: String(selectedTrade.stopLoss),
      takeProfit: String(selectedTrade.takeProfit),
      rrAchieved: String(selectedTrade.rrAchieved),
      entryTimeframe: selectedTrade.entryTimeframe ?? "",
      tradeTime: selectedTrade.tradeTime ?? "",
      result: selectedTrade.result,
      emotion: selectedTrade.emotion,
      notes: selectedTrade.notes,
    });
    setSheetMode("edit");
  };

  // ── Save edited trade
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrade) return;
    if (!editForm.tradeType || !editForm.result) {
      toast.error("Please select trade type and result");
      return;
    }
    try {
      const updated: Trade = {
        ...selectedTrade,
        date: editForm.date,
        pair: editForm.pair,
        tradeType: editForm.tradeType as TradeType,
        entryPrice: Number.parseFloat(editForm.entryPrice) || 0,
        stopLoss: Number.parseFloat(editForm.stopLoss) || 0,
        takeProfit: Number.parseFloat(editForm.takeProfit) || 0,
        rrAchieved: Number.parseFloat(editForm.rrAchieved) || 0,
        result: editForm.result as TradeResult,
        emotion: editForm.emotion,
        notes: editForm.notes,
        entryTimeframe: editForm.entryTimeframe,
        tradeTime: editForm.tradeTime,
      };
      await updateTrade.mutateAsync(updated);
      toast.success("Trade updated");
      setSheetOpen(false);
      setSelectedTrade(null);
    } catch {
      toast.error("Failed to update trade");
    }
  };

  // ── Delete trade
  const handleDelete = async () => {
    if (!selectedTrade) return;
    try {
      await deleteTrade.mutateAsync(selectedTrade.id);
      toast.success(`Trade deleted — ${selectedTrade.pair}`);
      setSheetOpen(false);
      setSelectedTrade(null);
    } catch {
      toast.error("Failed to delete trade");
    }
  };

  // ── Sorted trades
  const sortedTrades = [...(trades ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <section
      data-ocid="journal.section"
      className="p-4 md:p-6 space-y-6 animate-fade-in max-w-2xl"
    >
      {/* ── Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          Journal
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Log your completed trade with full context
        </p>
      </motion.div>

      {/* ── TradingView Data Loaded Banner */}
      <AnimatePresence>
        {tvBannerVisible && (
          <motion.div
            key="tv-banner"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            data-ocid="journal.tv.success_state"
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-win/10 border border-win/25 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-win/5 to-transparent pointer-events-none" />
            <div className="w-8 h-8 rounded-xl bg-win/20 flex items-center justify-center shrink-0">
              <Tv2 className="w-4 h-4 text-win" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-semibold text-win">
                TradingView data loaded
              </p>
              <p className="text-xs text-win/70 font-body mt-0.5 leading-relaxed">
                Review the pre-filled fields below and complete the remaining
                details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTvBannerVisible(false)}
              className="shrink-0 p-1.5 rounded-lg hover:bg-win/20 text-win/70 hover:text-win transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── New Trade Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card rounded-2xl p-5 space-y-5"
        data-ocid="journal.form.section"
      >
        {/* Trade Details: Date, Pair, Timeframe, Time */}
        <div>
          <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Trade Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">
                Date
              </Label>
              <Input
                data-ocid="journal.date.input"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="bg-input/50 border-border/50 focus:border-win/50 font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body flex items-center">
                Pair / Asset
                {tvFilledFields.has("pair") && <TVBadge />}
              </Label>
              <Input
                data-ocid="journal.pair.input"
                placeholder="EURUSD"
                value={form.pair}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pair: e.target.value.toUpperCase() }))
                }
                className={`font-mono bg-input/50 border-border/50 focus:border-win/50 uppercase ${
                  tvFilledFields.has("pair") ? "border-win/30 bg-win/5" : ""
                }`}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body flex items-center">
                Entry Timeframe
                {tvFilledFields.has("entryTimeframe") && <TVBadge />}
              </Label>
              <Select
                value={form.entryTimeframe}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, entryTimeframe: v }))
                }
              >
                <SelectTrigger
                  data-ocid="journal.timeframe.select"
                  className={`bg-input/50 border-border/50 focus:border-win/50 font-mono ${
                    tvFilledFields.has("entryTimeframe")
                      ? "border-win/30 bg-win/5"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select TF" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAME_OPTIONS.map((tf) => (
                    <SelectItem key={tf} value={tf} className="font-mono">
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Trade Time
                {tvFilledFields.has("tradeTime") && <TVBadge />}
              </Label>
              <Input
                data-ocid="journal.tradetime.input"
                type="time"
                value={form.tradeTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tradeTime: e.target.value }))
                }
                className={`font-mono bg-input/50 border-border/50 focus:border-win/50 ${
                  tvFilledFields.has("tradeTime")
                    ? "border-win/30 bg-win/5"
                    : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Trade Direction */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body">
              Trade Type
            </Label>
            <Select
              value={form.tradeType}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, tradeType: v as TradeType }))
              }
            >
              <SelectTrigger
                data-ocid="journal.tradetype.select"
                className="bg-input/50 border-border/50 focus:border-win/50 font-body"
              >
                <SelectValue placeholder="Buy / Sell" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TradeType.buy}>
                  <span className="text-win font-semibold">BUY (Long)</span>
                </SelectItem>
                <SelectItem value={TradeType.sell}>
                  <span className="text-loss font-semibold">SELL (Short)</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body">
              Result
            </Label>
            <Select
              value={form.result}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, result: v as TradeResult }))
              }
            >
              <SelectTrigger
                data-ocid="journal.result.select"
                className="bg-input/50 border-border/50 focus:border-win/50 font-body"
              >
                <SelectValue placeholder="Win / Loss / BE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TradeResult.win}>
                  <span className="text-win font-semibold">Win ✓</span>
                </SelectItem>
                <SelectItem value={TradeResult.loss}>
                  <span className="text-loss font-semibold">Loss ✗</span>
                </SelectItem>
                <SelectItem value={TradeResult.be}>
                  <span className="text-be font-semibold">Break Even ◎</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Levels */}
        <div>
          <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Price Levels
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body flex items-center">
                Entry Price
                {tvFilledFields.has("entryPrice") && <TVBadge />}
              </Label>
              <Input
                data-ocid="journal.entry.input"
                type="number"
                step="any"
                placeholder="1.08500"
                value={form.entryPrice}
                onChange={(e) =>
                  setForm((p) => ({ ...p, entryPrice: e.target.value }))
                }
                className={`font-mono bg-input/50 border-border/50 focus:border-win/50 ${
                  tvFilledFields.has("entryPrice")
                    ? "border-win/30 bg-win/5"
                    : ""
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body flex items-center">
                Stop Loss
                {tvFilledFields.has("stopLoss") && <TVBadge />}
              </Label>
              <Input
                data-ocid="journal.sl.input"
                type="number"
                step="any"
                placeholder="1.08200"
                value={form.stopLoss}
                onChange={(e) =>
                  setForm((p) => ({ ...p, stopLoss: e.target.value }))
                }
                className={`font-mono bg-input/50 border-border/50 focus:border-loss/50 ${
                  tvFilledFields.has("stopLoss") ? "border-win/30 bg-win/5" : ""
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body flex items-center">
                Take Profit
                {tvFilledFields.has("takeProfit") && <TVBadge />}
              </Label>
              <Input
                data-ocid="journal.tp.input"
                type="number"
                step="any"
                placeholder="1.09100"
                value={form.takeProfit}
                onChange={(e) =>
                  setForm((p) => ({ ...p, takeProfit: e.target.value }))
                }
                className={`font-mono bg-input/50 border-border/50 focus:border-win/50 ${
                  tvFilledFields.has("takeProfit")
                    ? "border-win/30 bg-win/5"
                    : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* RR & Emotion */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body flex items-center">
              RR Achieved
              {tvFilledFields.has("rrAchieved") && <TVBadge />}
            </Label>
            <Input
              data-ocid="journal.rr.input"
              type="number"
              step="0.01"
              placeholder="2.50"
              value={form.rrAchieved}
              onChange={(e) =>
                setForm((p) => ({ ...p, rrAchieved: e.target.value }))
              }
              className={`font-mono bg-input/50 border-border/50 focus:border-win/50 ${
                tvFilledFields.has("rrAchieved") ? "border-win/30 bg-win/5" : ""
              }`}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body">
              Emotion Before Trade
            </Label>
            <Input
              data-ocid="journal.emotion.input"
              placeholder="Confident / Fearful / Calm..."
              value={form.emotion}
              onChange={(e) =>
                setForm((p) => ({ ...p, emotion: e.target.value }))
              }
              className="bg-input/50 border-border/50 focus:border-win/50 font-body"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-body">
            Trade Notes
          </Label>
          <Textarea
            data-ocid="journal.notes.textarea"
            placeholder="Describe your setup, execution quality, and lessons learned..."
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="bg-input/50 border-border/50 focus:border-win/50 font-body resize-none min-h-[90px]"
          />
        </div>

        {/* Screenshot Upload */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground font-body">
            Chart Screenshot (optional)
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleScreenshot}
            className="hidden"
          />

          {screenshot ? (
            <div className="relative rounded-xl overflow-hidden border border-border/40">
              <img
                src={screenshot}
                alt="Chart screenshot"
                className="w-full h-40 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setScreenshot(null);
                  setScreenshotName("");
                }}
                className="absolute top-2 right-2 bg-background/80 backdrop-blur rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/80 to-transparent px-3 py-2">
                <span className="text-xs text-muted-foreground font-body truncate block">
                  {screenshotName}
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              data-ocid="journal.screenshot.upload_button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 rounded-xl border-2 border-dashed border-border/50 hover:border-win/40 hover:bg-win/5 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="p-2 rounded-xl bg-muted/50 group-hover:bg-win/10 transition-colors">
                <Image className="w-4 h-4 text-muted-foreground group-hover:text-win transition-colors" />
              </div>
              <div className="text-center">
                <div className="text-xs font-body text-muted-foreground">
                  <span className="text-win">Upload screenshot</span> or drag &
                  drop
                </div>
                <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                  PNG, JPG up to 10MB
                </div>
              </div>
            </button>
          )}
        </div>

        <Button
          type="submit"
          data-ocid="journal.save.button"
          disabled={createTrade.isPending}
          className="w-full bg-win hover:bg-win/90 text-background font-body font-semibold rounded-xl h-11"
        >
          {createTrade.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Trade...
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4 mr-2" /> Save Trade
            </>
          )}
        </Button>
      </motion.form>

      {/* ── TradingView Setup Guide */}
      <TVSetupGuide />

      {/* ── Saved Trades Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        data-ocid="journal.list"
      >
        <h2 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-win" />
          Saved Trades
          {trades && (
            <span className="text-xs text-muted-foreground font-body ml-1">
              ({trades.length})
            </span>
          )}
        </h2>

        {tradesLoading ? (
          <div className="space-y-3" data-ocid="journal.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : sortedTrades.length === 0 ? (
          <div
            data-ocid="journal.empty_state"
            className="glass-card rounded-2xl p-8 text-center"
          >
            <BookMarked className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No trades logged yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Save your first trade using the form above
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2.5">
              {sortedTrades.map((trade, idx) => {
                const resultCfg =
                  RESULT_CONFIG[trade.result as TradeResult] ??
                  RESULT_CONFIG[TradeResult.be];
                const ResultIcon = resultCfg.icon;
                const markerIdx = idx + 1;

                return (
                  <motion.button
                    key={trade.id.toString()}
                    type="button"
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                    data-ocid={
                      markerIdx <= 3 ? `journal.item.${markerIdx}` : undefined
                    }
                    onClick={() => openTrade(trade)}
                    className="w-full text-left glass-card rounded-2xl p-4 hover:border-win/30 hover:bg-win/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: result icon + info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${resultCfg.bgClass}`}
                        >
                          <ResultIcon
                            className={`w-4 h-4 ${resultCfg.iconClass}`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-foreground text-sm">
                              {trade.pair}
                            </span>
                            <span
                              className={`text-[10px] font-body px-1.5 py-0.5 rounded-md ${
                                trade.tradeType === TradeType.buy
                                  ? "bg-win/10 text-win"
                                  : "bg-loss/10 text-loss"
                              }`}
                            >
                              {trade.tradeType.toUpperCase()}
                            </span>
                            <span
                              className={`text-[10px] font-body px-1.5 py-0.5 rounded-full ${resultCfg.badgeClass}`}
                            >
                              {resultCfg.label}
                            </span>
                            {trade.entryTimeframe && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30">
                                {trade.entryTimeframe}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <CalendarDays className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-xs text-muted-foreground/70 font-body">
                              {trade.date}
                            </span>
                            {trade.tradeTime && (
                              <>
                                <Clock className="w-3 h-3 text-muted-foreground/40" />
                                <span className="text-xs text-muted-foreground/60 font-mono">
                                  {trade.tradeTime}
                                </span>
                              </>
                            )}
                            {trade.notes && (
                              <span className="text-[10px] text-muted-foreground/50 font-body truncate max-w-28 hidden sm:block">
                                · {trade.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: RR + chevron */}
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
                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-win/60 transition-colors" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </motion.div>

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

      {/* ── Trade Detail / Edit Sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSelectedTrade(null);
        }}
      >
        <SheetContent
          data-ocid="journal.dialog"
          className="w-full sm:max-w-lg overflow-y-auto flex flex-col"
          style={{
            background: "oklch(var(--card) / 0.97)",
            backdropFilter: "blur(40px)",
            borderLeft: "1px solid oklch(var(--border) / 0.5)",
          }}
        >
          {selectedTrade && (
            <>
              <SheetHeader className="shrink-0 pb-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  {(() => {
                    const resultCfg =
                      RESULT_CONFIG[selectedTrade.result as TradeResult] ??
                      RESULT_CONFIG[TradeResult.be];
                    const ResultIcon = resultCfg.icon;
                    return (
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${resultCfg.bgClass}`}
                      >
                        <ResultIcon
                          className={`w-5 h-5 ${resultCfg.iconClass}`}
                        />
                      </div>
                    );
                  })()}
                  <div>
                    <SheetTitle className="text-foreground font-display text-base leading-tight">
                      {selectedTrade.pair}{" "}
                      <span
                        className={`text-sm font-mono ${
                          selectedTrade.tradeType === TradeType.buy
                            ? "text-win"
                            : "text-loss"
                        }`}
                      >
                        {selectedTrade.tradeType.toUpperCase()}
                      </span>
                      {selectedTrade.entryTimeframe && (
                        <span className="text-xs font-mono ml-2 px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30">
                          {selectedTrade.entryTimeframe}
                        </span>
                      )}
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground text-xs font-body mt-0.5">
                      {sheetMode === "view"
                        ? `Trade entry — ${selectedTrade.date}${selectedTrade.tradeTime ? ` at ${selectedTrade.tradeTime}` : ""}`
                        : "Edit trade details below"}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 py-4">
                <AnimatePresence mode="wait">
                  {sheetMode === "view" ? (
                    /* ── View Mode */
                    <motion.div
                      key="view"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1"
                    >
                      <div className="glass-card rounded-xl p-4 space-y-0.5">
                        <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Trade Details
                        </h4>
                        <ViewField
                          label="Date"
                          value={selectedTrade.date}
                          mono
                        />
                        <ViewField
                          label="Time"
                          value={selectedTrade.tradeTime || "—"}
                          mono
                        />
                        <ViewField
                          label="Pair / Asset"
                          value={selectedTrade.pair}
                          mono
                        />
                        <ViewField
                          label="Entry Timeframe"
                          value={selectedTrade.entryTimeframe || "—"}
                          mono
                        />
                        <ViewField
                          label="Trade Type"
                          value={selectedTrade.tradeType.toUpperCase()}
                          accent={
                            selectedTrade.tradeType === TradeType.buy
                              ? "win"
                              : "loss"
                          }
                        />
                        <ViewField
                          label="Result"
                          value={
                            RESULT_CONFIG[selectedTrade.result as TradeResult]
                              ?.label ?? selectedTrade.result
                          }
                          accent={
                            selectedTrade.result === TradeResult.win
                              ? "win"
                              : selectedTrade.result === TradeResult.loss
                                ? "loss"
                                : "be"
                          }
                        />
                      </div>

                      <div className="glass-card rounded-xl p-4 space-y-0.5 mt-3">
                        <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Price Levels
                        </h4>
                        <ViewField
                          label="Entry Price"
                          value={selectedTrade.entryPrice.toFixed(5)}
                          mono
                        />
                        <ViewField
                          label="Stop Loss"
                          value={selectedTrade.stopLoss.toFixed(5)}
                          mono
                          accent="loss"
                        />
                        <ViewField
                          label="Take Profit"
                          value={selectedTrade.takeProfit.toFixed(5)}
                          mono
                          accent="win"
                        />
                        <ViewField
                          label="RR Achieved"
                          value={`${selectedTrade.rrAchieved >= 0 ? "+" : ""}${selectedTrade.rrAchieved.toFixed(2)}R`}
                          mono
                          accent={
                            selectedTrade.rrAchieved >= 0 ? "win" : "loss"
                          }
                        />
                      </div>

                      <div className="glass-card rounded-xl p-4 space-y-0.5 mt-3">
                        <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Psychology & Notes
                        </h4>
                        <ViewField
                          label="Emotion Before"
                          value={selectedTrade.emotion}
                        />
                        {selectedTrade.notes ? (
                          <div className="py-2.5">
                            <p className="text-xs font-body text-muted-foreground mb-1.5">
                              Trade Notes
                            </p>
                            <p className="text-sm font-body text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              {selectedTrade.notes}
                            </p>
                          </div>
                        ) : (
                          <ViewField label="Trade Notes" value="" />
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    /* ── Edit Mode */
                    <motion.form
                      key="edit"
                      id="edit-trade-form"
                      onSubmit={handleEditSave}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Date & Pair */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Date
                          </Label>
                          <Input
                            data-ocid="journal.edit.date.input"
                            type="date"
                            value={editForm.date}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                date: e.target.value,
                              }))
                            }
                            className="bg-input/50 border-border/50 focus:border-win/50 font-mono"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Pair / Asset
                          </Label>
                          <Input
                            data-ocid="journal.edit.pair.input"
                            value={editForm.pair}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                pair: e.target.value.toUpperCase(),
                              }))
                            }
                            className="font-mono bg-input/50 border-border/50 focus:border-win/50 uppercase"
                            required
                          />
                        </div>
                      </div>

                      {/* Timeframe & Time */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Entry Timeframe
                          </Label>
                          <Select
                            value={editForm.entryTimeframe}
                            onValueChange={(v) =>
                              setEditForm((p) => ({
                                ...p,
                                entryTimeframe: v,
                              }))
                            }
                          >
                            <SelectTrigger
                              data-ocid="journal.edit.timeframe.select"
                              className="bg-input/50 border-border/50 focus:border-win/50 font-mono"
                            >
                              <SelectValue placeholder="TF" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEFRAME_OPTIONS.map((tf) => (
                                <SelectItem
                                  key={tf}
                                  value={tf}
                                  className="font-mono"
                                >
                                  {tf}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Trade Time
                          </Label>
                          <Input
                            data-ocid="journal.edit.tradetime.input"
                            type="time"
                            value={editForm.tradeTime}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                tradeTime: e.target.value,
                              }))
                            }
                            className="font-mono bg-input/50 border-border/50 focus:border-win/50"
                          />
                        </div>
                      </div>

                      {/* Trade Type & Result */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Trade Type
                          </Label>
                          <Select
                            value={editForm.tradeType}
                            onValueChange={(v) =>
                              setEditForm((p) => ({
                                ...p,
                                tradeType: v as TradeType,
                              }))
                            }
                          >
                            <SelectTrigger
                              data-ocid="journal.edit.tradetype.select"
                              className="bg-input/50 border-border/50 focus:border-win/50 font-body"
                            >
                              <SelectValue placeholder="Buy / Sell" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={TradeType.buy}>
                                <span className="text-win font-semibold">
                                  BUY (Long)
                                </span>
                              </SelectItem>
                              <SelectItem value={TradeType.sell}>
                                <span className="text-loss font-semibold">
                                  SELL (Short)
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Result
                          </Label>
                          <Select
                            value={editForm.result}
                            onValueChange={(v) =>
                              setEditForm((p) => ({
                                ...p,
                                result: v as TradeResult,
                              }))
                            }
                          >
                            <SelectTrigger
                              data-ocid="journal.edit.result.select"
                              className="bg-input/50 border-border/50 focus:border-win/50 font-body"
                            >
                              <SelectValue placeholder="Win / Loss / BE" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={TradeResult.win}>
                                <span className="text-win font-semibold">
                                  Win ✓
                                </span>
                              </SelectItem>
                              <SelectItem value={TradeResult.loss}>
                                <span className="text-loss font-semibold">
                                  Loss ✗
                                </span>
                              </SelectItem>
                              <SelectItem value={TradeResult.be}>
                                <span className="text-be font-semibold">
                                  Break Even ◎
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Price Levels */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Entry
                          </Label>
                          <Input
                            data-ocid="journal.edit.entry.input"
                            type="number"
                            step="any"
                            value={editForm.entryPrice}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                entryPrice: e.target.value,
                              }))
                            }
                            className="font-mono bg-input/50 border-border/50 focus:border-win/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Stop Loss
                          </Label>
                          <Input
                            data-ocid="journal.edit.sl.input"
                            type="number"
                            step="any"
                            value={editForm.stopLoss}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                stopLoss: e.target.value,
                              }))
                            }
                            className="font-mono bg-input/50 border-border/50 focus:border-loss/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Take Profit
                          </Label>
                          <Input
                            data-ocid="journal.edit.tp.input"
                            type="number"
                            step="any"
                            value={editForm.takeProfit}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                takeProfit: e.target.value,
                              }))
                            }
                            className="font-mono bg-input/50 border-border/50 focus:border-win/50"
                          />
                        </div>
                      </div>

                      {/* RR & Emotion */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            RR Achieved
                          </Label>
                          <Input
                            data-ocid="journal.edit.rr.input"
                            type="number"
                            step="0.01"
                            value={editForm.rrAchieved}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                rrAchieved: e.target.value,
                              }))
                            }
                            className="font-mono bg-input/50 border-border/50 focus:border-win/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Emotion
                          </Label>
                          <Input
                            data-ocid="journal.edit.emotion.input"
                            value={editForm.emotion}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                emotion: e.target.value,
                              }))
                            }
                            className="bg-input/50 border-border/50 focus:border-win/50 font-body"
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground font-body">
                          Trade Notes
                        </Label>
                        <Textarea
                          data-ocid="journal.edit.notes.textarea"
                          value={editForm.notes}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              notes: e.target.value,
                            }))
                          }
                          className="bg-input/50 border-border/50 focus:border-win/50 font-body resize-none min-h-[90px]"
                        />
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Sheet Actions */}
              <div className="shrink-0 pt-4 border-t border-border/30 space-y-2">
                {sheetMode === "view" ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      data-ocid="journal.edit_button"
                      onClick={enterEditMode}
                      className="flex-1 bg-win/10 hover:bg-win/20 text-win border border-win/20 hover:border-win/40 rounded-xl h-10 font-body font-semibold transition-all"
                    >
                      <Edit2 className="w-4 h-4 mr-2" /> Edit Trade
                    </Button>
                    <Button
                      type="button"
                      data-ocid="journal.delete_button"
                      variant="ghost"
                      onClick={handleDelete}
                      disabled={deleteTrade.isPending}
                      className="h-10 px-4 rounded-xl text-muted-foreground/60 hover:text-loss hover:bg-loss/10 transition-all"
                    >
                      {deleteTrade.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      form="edit-trade-form"
                      data-ocid="journal.edit.save_button"
                      disabled={updateTrade.isPending}
                      className="flex-1 bg-win hover:bg-win/90 text-background font-body font-semibold rounded-xl h-10"
                    >
                      {updateTrade.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Saving...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" /> Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      data-ocid="journal.edit.cancel_button"
                      variant="ghost"
                      onClick={() => setSheetMode("view")}
                      className="h-10 px-4 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
