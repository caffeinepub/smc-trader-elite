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
import { Textarea } from "@/components/ui/textarea";
import { Image, Loader2, PenLine, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { TradeResult, TradeType } from "../backend.d";
import { useCreateTrade } from "../hooks/useQueries";

const defaultForm = {
  date: new Date().toISOString().split("T")[0],
  pair: "",
  tradeType: "" as TradeType | "",
  entryPrice: "",
  stopLoss: "",
  takeProfit: "",
  rrAchieved: "",
  result: "" as TradeResult | "",
  emotion: "",
  notes: "",
};

export default function Journal() {
  const [form, setForm] = useState(defaultForm);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createTrade = useCreateTrade();

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
      });
      toast.success("Trade logged successfully");
      setForm({ ...defaultForm, date: new Date().toISOString().split("T")[0] });
      setScreenshot(null);
      setScreenshotName("");
    } catch {
      toast.error("Failed to save trade");
    }
  };

  return (
    <section
      data-ocid="journal.form.section"
      className="p-4 md:p-6 space-y-6 animate-fade-in max-w-2xl"
    >
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

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card rounded-2xl p-5 space-y-5"
      >
        {/* Date & Pair */}
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
              <Label className="text-xs text-muted-foreground font-body">
                Pair / Asset
              </Label>
              <Input
                placeholder="EURUSD"
                value={form.pair}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pair: e.target.value.toUpperCase() }))
                }
                className="font-mono bg-input/50 border-border/50 focus:border-win/50 uppercase"
                required
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
              <SelectTrigger className="bg-input/50 border-border/50 focus:border-win/50 font-body">
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
              <SelectTrigger className="bg-input/50 border-border/50 focus:border-win/50 font-body">
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
              <Label className="text-xs text-muted-foreground font-body">
                Entry Price
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="1.08500"
                value={form.entryPrice}
                onChange={(e) =>
                  setForm((p) => ({ ...p, entryPrice: e.target.value }))
                }
                className="font-mono bg-input/50 border-border/50 focus:border-win/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">
                Stop Loss
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="1.08200"
                value={form.stopLoss}
                onChange={(e) =>
                  setForm((p) => ({ ...p, stopLoss: e.target.value }))
                }
                className="font-mono bg-input/50 border-border/50 focus:border-loss/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">
                Take Profit
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="1.09100"
                value={form.takeProfit}
                onChange={(e) =>
                  setForm((p) => ({ ...p, takeProfit: e.target.value }))
                }
                className="font-mono bg-input/50 border-border/50 focus:border-win/50"
              />
            </div>
          </div>
        </div>

        {/* RR & Emotion */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body">
              RR Achieved
            </Label>
            <Input
              type="number"
              step="0.01"
              placeholder="2.50"
              value={form.rrAchieved}
              onChange={(e) =>
                setForm((p) => ({ ...p, rrAchieved: e.target.value }))
              }
              className="font-mono bg-input/50 border-border/50 focus:border-win/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body">
              Emotion Before Trade
            </Label>
            <Input
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
