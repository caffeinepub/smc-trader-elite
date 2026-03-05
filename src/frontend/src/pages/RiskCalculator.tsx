import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Calculator,
  DollarSign,
  Percent,
  TrendingDown,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function RiskCalculator() {
  const [balance, setBalance] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [slDistance, setSlDistance] = useState("");

  const calcResult = (): {
    positionSize: number;
    riskAmount: number;
  } | null => {
    const bal = Number.parseFloat(balance);
    const risk = Number.parseFloat(riskPercent);
    const sl = Number.parseFloat(slDistance);
    if (!bal || !risk || !sl || sl === 0 || bal <= 0 || risk <= 0) return null;
    const riskAmount = (bal * risk) / 100;
    const positionSize = riskAmount / sl;
    return { positionSize, riskAmount };
  };

  const result = calcResult();

  return (
    <section
      data-ocid="calculator.section"
      className="p-4 md:p-6 space-y-6 animate-fade-in max-w-lg"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          Risk Calculator
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Calculate your position size before entering a trade
        </p>
      </motion.div>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card rounded-2xl p-5 space-y-5"
      >
        <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
          Inputs
        </h3>

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
            Risk % per Trade
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

        {/* Stop Loss Distance */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-body flex items-center gap-1.5">
            <TrendingDown className="w-3 h-3 text-loss" />
            Stop Loss Distance (pips / points)
          </Label>
          <Input
            data-ocid="calculator.sl.input"
            type="number"
            placeholder="20"
            min="0.1"
            step="any"
            value={slDistance}
            onChange={(e) => setSlDistance(e.target.value)}
            className="font-mono bg-input/50 border-border/50 focus:border-loss/50 focus:ring-loss/20 h-11 text-base"
          />
          <p className="text-[10px] text-muted-foreground/60 font-body">
            Formula: Position Size = (Balance × Risk%) ÷ SL Distance
          </p>
        </div>

        {/* Arrow Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border/40" />
          <div className="p-1.5 rounded-xl bg-muted/50">
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {/* Result Card */}
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            data-ocid="calculator.result.card"
            className="rounded-2xl p-5 bg-gradient-to-br from-win/10 to-win/5 border border-win/20 shadow-glow"
          >
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wider">
                  Position Size
                </div>
                <div className="text-4xl font-display font-bold text-win tracking-tight">
                  {result.positionSize.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </div>
                <div className="text-sm text-muted-foreground font-body mt-1">
                  units / lots
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-win/10">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground font-body">
                    Risk Amount
                  </div>
                  <div className="text-lg font-mono font-bold text-foreground mt-0.5">
                    $
                    {result.riskAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground font-body">
                    Risk %
                  </div>
                  <div
                    className={`text-lg font-mono font-bold mt-0.5 ${
                      Number.parseFloat(riskPercent) <= 2
                        ? "text-win"
                        : Number.parseFloat(riskPercent) <= 5
                          ? "text-be"
                          : "text-loss"
                    }`}
                  >
                    {Number.parseFloat(riskPercent).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div
                className={`text-xs text-center font-body rounded-xl px-3 py-2 ${
                  Number.parseFloat(riskPercent) <= 1
                    ? "bg-win/10 text-win"
                    : Number.parseFloat(riskPercent) <= 3
                      ? "bg-be/10 text-be"
                      : "bg-loss/10 text-loss"
                }`}
              >
                {Number.parseFloat(riskPercent) <= 1
                  ? "✓ Conservative risk — excellent position sizing"
                  : Number.parseFloat(riskPercent) <= 3
                    ? "⚡ Moderate risk — proceed with discipline"
                    : "⚠ High risk — consider reducing position size"}
              </div>
            </div>
          </motion.div>
        ) : (
          <div
            data-ocid="calculator.result.card"
            className="rounded-2xl p-8 bg-muted/20 border border-border/30 text-center"
          >
            <Calculator className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/60 font-body">
              Enter your values above to calculate
            </p>
          </div>
        )}
      </motion.div>

      {/* Pip Value Reference */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card rounded-2xl p-5"
      >
        <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Reference — Pip Values
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { pair: "EURUSD", pip: "0.0001", value: "$10/lot" },
            { pair: "GBPUSD", pip: "0.0001", value: "$10/lot" },
            { pair: "USDJPY", pip: "0.01", value: "≈$9/lot" },
            { pair: "XAUUSD", pip: "0.01", value: "$1/lot" },
          ].map((item) => (
            <div
              key={item.pair}
              className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-muted/30"
            >
              <span className="font-mono font-semibold text-foreground">
                {item.pair}
              </span>
              <span className="text-muted-foreground/70 font-body">
                {item.value}
              </span>
            </div>
          ))}
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
