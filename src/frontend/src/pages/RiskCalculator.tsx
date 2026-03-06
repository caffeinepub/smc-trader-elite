import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Percent,
  Search,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

// ─── Instrument Data ──────────────────────────────────────────────────────────

interface Instrument {
  symbol: string;
  name: string;
  category: "forex" | "commodity" | "crypto";
  pipSize: number;
  pipValue: number; // USD per pip per standard lot
  contractSize: number;
  decimals: number;
  unit: string; // display unit for position
}

const INSTRUMENTS: Instrument[] = [
  // Forex Majors
  {
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 10,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "GBPUSD",
    name: "British Pound / US Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 10,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "USDJPY",
    name: "US Dollar / Japanese Yen",
    category: "forex",
    pipSize: 0.01,
    pipValue: 9,
    contractSize: 100000,
    decimals: 3,
    unit: "lots",
  },
  {
    symbol: "USDCHF",
    name: "US Dollar / Swiss Franc",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 10,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "USDCAD",
    name: "US Dollar / Canadian Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 7.5,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "AUDUSD",
    name: "Australian Dollar / US Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 10,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "NZDUSD",
    name: "New Zealand Dollar / US Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 10,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  // Forex Minors
  {
    symbol: "EURGBP",
    name: "Euro / British Pound",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 12.5,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "EURJPY",
    name: "Euro / Japanese Yen",
    category: "forex",
    pipSize: 0.01,
    pipValue: 9,
    contractSize: 100000,
    decimals: 3,
    unit: "lots",
  },
  {
    symbol: "GBPJPY",
    name: "British Pound / Japanese Yen",
    category: "forex",
    pipSize: 0.01,
    pipValue: 9,
    contractSize: 100000,
    decimals: 3,
    unit: "lots",
  },
  {
    symbol: "AUDJPY",
    name: "Australian Dollar / Japanese Yen",
    category: "forex",
    pipSize: 0.01,
    pipValue: 9,
    contractSize: 100000,
    decimals: 3,
    unit: "lots",
  },
  {
    symbol: "CADJPY",
    name: "Canadian Dollar / Japanese Yen",
    category: "forex",
    pipSize: 0.01,
    pipValue: 9,
    contractSize: 100000,
    decimals: 3,
    unit: "lots",
  },
  {
    symbol: "EURAUD",
    name: "Euro / Australian Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 6.5,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "GBPAUD",
    name: "British Pound / Australian Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 6.5,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "EURNZD",
    name: "Euro / New Zealand Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 6,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "GBPNZD",
    name: "British Pound / New Zealand Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 6,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  // Forex Exotics
  {
    symbol: "USDZAR",
    name: "US Dollar / South African Rand",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 0.55,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "USDMXN",
    name: "US Dollar / Mexican Peso",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 0.5,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "USDSEK",
    name: "US Dollar / Swedish Krona",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 0.95,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "USDNOK",
    name: "US Dollar / Norwegian Krone",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 0.95,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "EURTRY",
    name: "Euro / Turkish Lira",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 0.3,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  {
    symbol: "USDTRY",
    name: "US Dollar / Turkish Lira",
    category: "forex",
    pipSize: 0.0001,
    pipValue: 0.3,
    contractSize: 100000,
    decimals: 5,
    unit: "lots",
  },
  // Commodities — Metals
  {
    symbol: "XAUUSD",
    name: "Gold / US Dollar",
    category: "commodity",
    pipSize: 0.01,
    pipValue: 1,
    contractSize: 100,
    decimals: 2,
    unit: "oz",
  },
  {
    symbol: "XAGUSD",
    name: "Silver / US Dollar",
    category: "commodity",
    pipSize: 0.001,
    pipValue: 5,
    contractSize: 5000,
    decimals: 3,
    unit: "oz",
  },
  {
    symbol: "XPTUSD",
    name: "Platinum / US Dollar",
    category: "commodity",
    pipSize: 0.01,
    pipValue: 0.5,
    contractSize: 50,
    decimals: 2,
    unit: "oz",
  },
  // Commodities — Energy
  {
    symbol: "USOIL",
    name: "Crude Oil WTI",
    category: "commodity",
    pipSize: 0.01,
    pipValue: 10,
    contractSize: 1000,
    decimals: 2,
    unit: "barrels",
  },
  {
    symbol: "UKOIL",
    name: "Brent Crude Oil",
    category: "commodity",
    pipSize: 0.01,
    pipValue: 10,
    contractSize: 1000,
    decimals: 2,
    unit: "barrels",
  },
  {
    symbol: "NATGAS",
    name: "Natural Gas",
    category: "commodity",
    pipSize: 0.001,
    pipValue: 10,
    contractSize: 10000,
    decimals: 3,
    unit: "mmBtu",
  },
  // Commodities — Softs
  {
    symbol: "WHEAT",
    name: "Wheat",
    category: "commodity",
    pipSize: 0.01,
    pipValue: 50,
    contractSize: 5000,
    decimals: 2,
    unit: "bushels",
  },
  {
    symbol: "CORN",
    name: "Corn",
    category: "commodity",
    pipSize: 0.01,
    pipValue: 50,
    contractSize: 5000,
    decimals: 2,
    unit: "bushels",
  },
  {
    symbol: "COFFEE",
    name: "Coffee",
    category: "commodity",
    pipSize: 0.01,
    pipValue: 37.5,
    contractSize: 37500,
    decimals: 2,
    unit: "lbs",
  },
  {
    symbol: "COTTON",
    name: "Cotton",
    category: "commodity",
    pipSize: 0.01,
    pipValue: 50,
    contractSize: 50000,
    decimals: 2,
    unit: "lbs",
  },
  // Crypto
  {
    symbol: "BTCUSD",
    name: "Bitcoin / US Dollar",
    category: "crypto",
    pipSize: 1,
    pipValue: 1,
    contractSize: 1,
    decimals: 2,
    unit: "BTC",
  },
  {
    symbol: "ETHUSD",
    name: "Ethereum / US Dollar",
    category: "crypto",
    pipSize: 0.01,
    pipValue: 1,
    contractSize: 1,
    decimals: 2,
    unit: "ETH",
  },
  {
    symbol: "BNBUSD",
    name: "BNB / US Dollar",
    category: "crypto",
    pipSize: 0.01,
    pipValue: 1,
    contractSize: 1,
    decimals: 2,
    unit: "BNB",
  },
  {
    symbol: "XRPUSD",
    name: "XRP / US Dollar",
    category: "crypto",
    pipSize: 0.0001,
    pipValue: 1,
    contractSize: 1,
    decimals: 4,
    unit: "XRP",
  },
  {
    symbol: "ADAUSD",
    name: "Cardano / US Dollar",
    category: "crypto",
    pipSize: 0.0001,
    pipValue: 1,
    contractSize: 1,
    decimals: 4,
    unit: "ADA",
  },
  {
    symbol: "SOLUSDT",
    name: "Solana / US Dollar",
    category: "crypto",
    pipSize: 0.01,
    pipValue: 1,
    contractSize: 1,
    decimals: 2,
    unit: "SOL",
  },
  {
    symbol: "DOTUSD",
    name: "Polkadot / US Dollar",
    category: "crypto",
    pipSize: 0.001,
    pipValue: 1,
    contractSize: 1,
    decimals: 3,
    unit: "DOT",
  },
  {
    symbol: "LINKUSD",
    name: "Chainlink / US Dollar",
    category: "crypto",
    pipSize: 0.001,
    pipValue: 1,
    contractSize: 1,
    decimals: 3,
    unit: "LINK",
  },
  {
    symbol: "LTCUSD",
    name: "Litecoin / US Dollar",
    category: "crypto",
    pipSize: 0.01,
    pipValue: 1,
    contractSize: 1,
    decimals: 2,
    unit: "LTC",
  },
  {
    symbol: "AVAXUSD",
    name: "Avalanche / US Dollar",
    category: "crypto",
    pipSize: 0.01,
    pipValue: 1,
    contractSize: 1,
    decimals: 2,
    unit: "AVAX",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  forex: "Forex",
  commodity: "Commodities",
  crypto: "Crypto",
};

const CATEGORY_COLORS: Record<string, string> = {
  forex: "text-be bg-be/10 border-be/20",
  commodity: "text-chart-4 bg-chart-4/10 border-chart-4/20",
  crypto: "text-chart-5 bg-chart-5/10 border-chart-5/20",
};

const RISK_PILLS = [
  { label: "0.5%", value: "0.5" },
  { label: "1%", value: "1" },
  { label: "1.5%", value: "1.5" },
  { label: "2%", value: "2" },
];

// ─── Quick reference instruments ──────────────────────────────────────────────

const REFERENCE_INSTRUMENTS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "XAUUSD",
  "USOIL",
  "BTCUSD",
  "ETHUSD",
  "XAGUSD",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RiskCalculator() {
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showInstrumentPicker, setShowInstrumentPicker] = useState(true);

  const [balance, setBalance] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");

  // ── Filtered instruments
  const filteredInstruments = useMemo(() => {
    return INSTRUMENTS.filter((inst) => {
      const matchesCategory =
        activeCategory === "all" || inst.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // ── Calculation
  const calc = useMemo(() => {
    if (!selectedInstrument) return null;
    const bal = Number.parseFloat(balance);
    const risk = Number.parseFloat(riskPercent);
    const entry = Number.parseFloat(entryPrice);
    const sl = Number.parseFloat(stopLoss);

    if (!bal || !risk || !entry || !sl || bal <= 0 || risk <= 0) return null;
    if (entry === sl) return null;

    const inst = selectedInstrument;
    const slDistancePrice = Math.abs(entry - sl);
    const slDistancePips = slDistancePrice / inst.pipSize;

    const riskAmount = (bal * risk) / 100;
    const positionSizeLots = riskAmount / (slDistancePips * inst.pipValue);
    const positionSizeUnits = positionSizeLots * inst.contractSize;

    const direction = entry > sl ? 1 : -1; // 1=long, -1=short
    const tp1 = entry + direction * slDistancePrice * 1;
    const tp2 = entry + direction * slDistancePrice * 2;
    const tp3 = entry + direction * slDistancePrice * 3;

    return {
      slDistancePrice,
      slDistancePips,
      riskAmount,
      positionSizeLots,
      positionSizeUnits,
      direction,
      tp1,
      tp2,
      tp3,
      profitAt1R: riskAmount,
      profitAt2R: riskAmount * 2,
      profitAt3R: riskAmount * 3,
    };
  }, [selectedInstrument, balance, riskPercent, entryPrice, stopLoss]);

  const riskNum = Number.parseFloat(riskPercent);
  const riskColor =
    riskNum <= 1 ? "text-win" : riskNum <= 3 ? "text-be" : "text-loss";
  const riskBg =
    riskNum <= 1
      ? "bg-win/10 text-win"
      : riskNum <= 3
        ? "bg-be/10 text-be"
        : "bg-loss/10 text-loss";
  const riskMessage =
    riskNum <= 1
      ? "✓ Conservative risk — excellent position sizing"
      : riskNum <= 3
        ? "⚡ Moderate risk — proceed with discipline"
        : "⚠ High risk — consider reducing position size";

  const formatPrice = (val: number) =>
    selectedInstrument
      ? val.toFixed(selectedInstrument.decimals)
      : val.toFixed(5);

  const formatPips = (pips: number) =>
    pips >= 100 ? pips.toFixed(0) : pips.toFixed(1);

  return (
    <section
      data-ocid="calculator.section"
      className="p-4 md:p-6 space-y-6 animate-fade-in max-w-2xl"
    >
      {/* ── Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          Risk Calculator
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Calculate position size for Forex, Commodities &amp; Crypto
        </p>
      </motion.div>

      {/* ─── Section 1: Instrument Selector ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        {/* Header toggle */}
        <button
          type="button"
          onClick={() => setShowInstrumentPicker((v) => !v)}
          className="w-full flex items-center justify-between p-5 hover:bg-win/5 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-win/10 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-win" />
            </div>
            <div className="text-left">
              <p className="text-sm font-body font-semibold text-foreground">
                {selectedInstrument
                  ? selectedInstrument.symbol
                  : "Select Instrument"}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                {selectedInstrument
                  ? `${selectedInstrument.name} · Pip: ${selectedInstrument.pipSize} · $${selectedInstrument.pipValue}/pip/lot`
                  : "Choose a trading instrument"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedInstrument && (
              <span
                className={`text-[10px] font-body font-semibold px-2 py-1 rounded-full border ${CATEGORY_COLORS[selectedInstrument.category]}`}
              >
                {CATEGORY_LABELS[selectedInstrument.category]}
              </span>
            )}
            <div className="text-muted-foreground/60 group-hover:text-foreground transition-colors">
              {showInstrumentPicker ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {showInstrumentPicker && (
            <motion.div
              key="picker"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-border/30 px-4 pb-4 space-y-3 pt-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                  <Input
                    data-ocid="calculator.instrument_search.input"
                    placeholder="Search instruments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm font-body bg-input/30 border-border/40 focus:border-win/50"
                  />
                </div>

                {/* Category Tabs */}
                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                  <TabsList className="h-8 bg-muted/30 border border-border/30 gap-0.5 p-0.5">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <TabsTrigger
                        key={key}
                        value={key}
                        data-ocid="calculator.category.tab"
                        className="h-7 px-3 text-xs font-body data-[state=active]:bg-win/20 data-[state=active]:text-win data-[state=active]:shadow-none rounded-md"
                      >
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                {/* Instrument Chips */}
                <ScrollArea className="h-[180px]">
                  {filteredInstruments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-28 text-center">
                      <Search className="w-6 h-6 text-muted-foreground/20 mb-2" />
                      <p className="text-xs text-muted-foreground/60 font-body">
                        No instruments found
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pr-3 pb-1">
                      {filteredInstruments.map((inst, idx) => {
                        const isSelected =
                          selectedInstrument?.symbol === inst.symbol;
                        const markerIdx = idx + 1;
                        return (
                          <button
                            key={inst.symbol}
                            type="button"
                            data-ocid={
                              markerIdx <= 3
                                ? `calculator.instrument.item.${markerIdx}`
                                : undefined
                            }
                            onClick={() => {
                              setSelectedInstrument(inst);
                              setEntryPrice("");
                              setStopLoss("");
                              setShowInstrumentPicker(false);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono font-semibold border transition-all ${
                              isSelected
                                ? "bg-win/20 border-win/40 text-win shadow-glow"
                                : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-win/10 hover:border-win/30 hover:text-win"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                inst.category === "forex"
                                  ? "bg-be"
                                  : inst.category === "commodity"
                                    ? "bg-chart-4"
                                    : "bg-chart-5"
                              }`}
                            />
                            {inst.symbol}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Selected instrument specs bar */}
              {selectedInstrument && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-border/20 px-4 py-3 bg-win/5 grid grid-cols-3 gap-3"
                >
                  <div className="text-center">
                    <div className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-0.5">
                      Pip Size
                    </div>
                    <div className="text-xs font-mono font-bold text-foreground">
                      {selectedInstrument.pipSize}
                    </div>
                  </div>
                  <div className="text-center border-x border-border/20">
                    <div className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-0.5">
                      Pip Value / Lot
                    </div>
                    <div className="text-xs font-mono font-bold text-win">
                      ${selectedInstrument.pipValue}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-0.5">
                      Contract Size
                    </div>
                    <div className="text-xs font-mono font-bold text-foreground">
                      {selectedInstrument.contractSize.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Section 2: Trade Inputs ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="glass-card rounded-2xl p-5 space-y-5"
      >
        <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
          Trade Inputs
        </h3>

        {/* Account Balance & Risk */}
        <div className="grid grid-cols-2 gap-3">
          {/* Account Balance */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" />
              Account Balance
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-mono text-sm">
                $
              </span>
              <Input
                data-ocid="calculator.balance.input"
                type="number"
                placeholder="10,000"
                min="0"
                step="any"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="pl-7 font-mono bg-input/50 border-border/50 focus:border-win/50 focus:ring-win/20 h-11 text-base"
              />
            </div>
          </div>

          {/* Risk % */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body flex items-center gap-1.5">
              <Percent className="w-3 h-3" />
              Risk Per Trade
            </Label>
            <div className="relative">
              <Input
                data-ocid="calculator.risk.input"
                type="number"
                placeholder="1.0"
                min="0.1"
                max="100"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                className="pr-8 font-mono bg-input/50 border-border/50 focus:border-win/50 focus:ring-win/20 h-11 text-base"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-mono text-sm">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Quick-select Risk Pills */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground/60 font-body shrink-0">
            Quick:
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {RISK_PILLS.map((pill, idx) => (
              <button
                key={pill.value}
                type="button"
                data-ocid={`calculator.risk_pill.${idx + 1}`}
                onClick={() => setRiskPercent(pill.value)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border transition-all ${
                  riskPercent === pill.value
                    ? "bg-win/20 border-win/40 text-win"
                    : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-win/10 hover:border-win/25 hover:text-win"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entry & Stop Loss */}
        {selectedInstrument ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Entry Price */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-body flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-win" />
                  Entry Price
                </Label>
                <Input
                  data-ocid="calculator.entry.input"
                  type="number"
                  step="any"
                  placeholder="e.g. 1.08500"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="font-mono bg-input/50 border-border/50 focus:border-win/50 focus:ring-win/20 h-11 text-base"
                />
              </div>

              {/* Stop Loss */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-body flex items-center gap-1.5">
                  <TrendingDown className="w-3 h-3 text-loss" />
                  Stop Loss Price
                </Label>
                <Input
                  data-ocid="calculator.sl.input"
                  type="number"
                  step="any"
                  placeholder="e.g. 1.08200"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="font-mono bg-input/50 border-loss/30 focus:border-loss/60 focus:ring-loss/15 h-11 text-base"
                />
              </div>
            </div>

            {/* SL Distance auto-display */}
            {calc && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/20 border border-border/30"
              >
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-xs font-body text-muted-foreground">
                  SL Distance:
                </span>
                <span className="text-xs font-mono font-bold text-loss">
                  {formatPips(calc.slDistancePips)} pips
                </span>
                <span className="text-xs text-muted-foreground/50">
                  ({calc.slDistancePrice.toFixed(selectedInstrument.decimals)}{" "}
                  pts)
                </span>
                <Badge
                  className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full border ${
                    calc.direction === 1
                      ? "bg-win/10 text-win border-win/20"
                      : "bg-loss/10 text-loss border-loss/20"
                  }`}
                >
                  {calc.direction === 1 ? "LONG" : "SHORT"}
                </Badge>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/30 p-4 text-center">
            <Activity className="w-5 h-5 text-muted-foreground/20 mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground/60 font-body">
              Select an instrument above to enable entry & stop loss inputs
            </p>
          </div>
        )}
      </motion.div>

      {/* ─── Section 3: Result Card ───────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {calc && selectedInstrument ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            data-ocid="calculator.result.card"
            className="glass-card rounded-2xl overflow-hidden border-win/20"
          >
            {/* Top gradient bar */}
            <div className="h-0.5 bg-gradient-to-r from-win/0 via-win/60 to-win/0" />

            <div className="p-5 space-y-4">
              {/* Position Size — Hero */}
              <div className="text-center py-2">
                <div className="text-[10px] font-body text-muted-foreground uppercase tracking-widest mb-2">
                  Recommended Position Size
                </div>
                {selectedInstrument.category === "forex" ? (
                  <>
                    <div className="text-4xl font-display font-bold text-win tracking-tight">
                      {calc.positionSizeLots.toFixed(2)}{" "}
                      <span className="text-2xl text-win/70">lots</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-mono mt-1">
                      ={" "}
                      {calc.positionSizeUnits.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      units
                    </div>
                  </>
                ) : selectedInstrument.category === "crypto" ? (
                  <>
                    <div className="text-4xl font-display font-bold text-win tracking-tight">
                      {calc.positionSizeUnits.toLocaleString("en-US", {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono mt-1">
                      {selectedInstrument.unit}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-display font-bold text-win tracking-tight">
                      {calc.positionSizeUnits.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono mt-1">
                      {selectedInstrument.unit}
                    </div>
                  </>
                )}
              </div>

              {/* Risk summary */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/20">
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-1">
                    Risk Amount
                  </div>
                  <div className="text-xl font-mono font-bold text-foreground">
                    $
                    {calc.riskAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-1">
                    Risk %
                  </div>
                  <div className={`text-xl font-mono font-bold ${riskColor}`}>
                    {riskNum.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* TP Suggestions */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Target className="w-3 h-3 text-muted-foreground/60" />
                  <span className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider">
                    Take Profit Targets
                  </span>
                </div>

                {/* 1:1 TP */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/20 border border-border/20">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground/70 w-6">
                      1R
                    </span>
                    <span className="text-xs font-mono text-foreground">
                      {formatPrice(calc.tp1)}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    +${calc.profitAt1R.toFixed(2)}
                  </span>
                </div>

                {/* 1:2 TP */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-win/8 border border-win/15">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-win/70 w-6">
                      2R
                    </span>
                    <span className="text-xs font-mono text-foreground">
                      {formatPrice(calc.tp2)}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-win/80">
                    +${calc.profitAt2R.toFixed(2)}
                  </span>
                </div>

                {/* 1:3 TP */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-win/15 border border-win/30">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-win w-6">
                      3R
                    </span>
                    <span className="text-xs font-mono text-foreground font-semibold">
                      {formatPrice(calc.tp3)}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-win">
                    +${calc.profitAt3R.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Risk assessment */}
              <div
                className={`text-xs text-center font-body rounded-xl px-3 py-2.5 font-medium ${riskBg}`}
              >
                {riskMessage}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-ocid="calculator.result.card"
            className="rounded-2xl p-8 bg-muted/10 border border-border/20 text-center"
          >
            <Calculator className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/60 font-body">
              {!selectedInstrument
                ? "Select an instrument to begin"
                : "Enter balance, risk %, entry price, and stop loss"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Section 4: Quick Reference ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="glass-card rounded-2xl p-5"
      >
        <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Target className="w-3 h-3" />
          Quick Reference — Pip Values
        </h3>

        {/* Selected instrument highlighted reference */}
        {selectedInstrument && (
          <div className="mb-3 p-3 rounded-xl bg-win/8 border border-win/20">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-sm font-mono font-bold text-win">
                  {selectedInstrument.symbol}
                </span>
                <span className="text-xs text-muted-foreground font-body ml-2">
                  {selectedInstrument.name}
                </span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${CATEGORY_COLORS[selectedInstrument.category]}`}
              >
                {CATEGORY_LABELS[selectedInstrument.category]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center">
                <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">
                  Pip Size
                </div>
                <div className="text-xs font-mono font-semibold text-foreground">
                  {selectedInstrument.pipSize}
                </div>
              </div>
              <div className="text-center border-x border-border/20">
                <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">
                  Pip Value
                </div>
                <div className="text-xs font-mono font-semibold text-win">
                  ${selectedInstrument.pipValue}/lot
                </div>
              </div>
              <div className="text-center">
                <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">
                  Contract
                </div>
                <div className="text-xs font-mono font-semibold text-foreground">
                  {selectedInstrument.contractSize.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reference table */}
        <div className="grid grid-cols-2 gap-1.5">
          {REFERENCE_INSTRUMENTS.map((sym) => {
            const inst = INSTRUMENTS.find((i) => i.symbol === sym);
            if (!inst) return null;
            const isSelected = selectedInstrument?.symbol === sym;
            return (
              <button
                key={sym}
                type="button"
                onClick={() => {
                  setSelectedInstrument(inst);
                  setEntryPrice("");
                  setStopLoss("");
                }}
                className={`flex items-center justify-between text-xs py-2 px-2.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "bg-win/10 border-win/30"
                    : "bg-muted/20 border-border/20 hover:bg-win/5 hover:border-win/20"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      inst.category === "forex"
                        ? "bg-be"
                        : inst.category === "commodity"
                          ? "bg-chart-4"
                          : "bg-chart-5"
                    }`}
                  />
                  <span className="font-mono font-semibold text-foreground">
                    {inst.symbol}
                  </span>
                </div>
                <span className="text-muted-foreground/70 font-body">
                  ${inst.pipValue}/lot
                </span>
              </button>
            );
          })}
        </div>
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
    </section>
  );
}
