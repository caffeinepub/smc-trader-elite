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
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { BookOpen, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Session } from "../backend.d";
import {
  useAllPlaybookEntries,
  useCreatePlaybookEntry,
  useDeletePlaybookEntry,
} from "../hooks/useQueries";

const SESSION_LABELS: Record<Session, string> = {
  [Session.asia]: "Asia",
  [Session.london]: "London",
  [Session.ny]: "New York",
};

const defaultForm = {
  pair: "",
  session: "" as Session | "",
  htfBias: "",
  marketStructure: "",
  liquidityTarget: "",
  poi: "",
  entryConfirmation: "",
  rrTarget: 2,
  qualityScore: 7,
};

export default function Playbook() {
  const [form, setForm] = useState(defaultForm);
  const { data: entries, isLoading } = useAllPlaybookEntries();
  const createEntry = useCreatePlaybookEntry();
  const deleteEntry = useDeletePlaybookEntry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.session) {
      toast.error("Please select a session");
      return;
    }
    if (!form.pair.trim()) {
      toast.error("Please enter a pair");
      return;
    }
    try {
      await createEntry.mutateAsync({
        pair: form.pair,
        session: form.session as Session,
        htfBias: form.htfBias,
        marketStructure: form.marketStructure,
        liquidityTarget: form.liquidityTarget,
        poi: form.poi,
        entryConfirmation: form.entryConfirmation,
        rrTarget: form.rrTarget,
        qualityScore: BigInt(form.qualityScore),
      });
      toast.success("Setup saved to playbook");
      setForm(defaultForm);
    } catch {
      toast.error("Failed to save setup");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteEntry.mutateAsync(id);
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <section
      data-ocid="playbook.form.section"
      className="p-4 md:p-6 space-y-6 animate-fade-in max-w-2xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          Playbook
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Pre-trade checklist — validate your setup before entering
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card rounded-2xl p-5 space-y-5"
      >
        {/* Section: Asset & Session */}
        <div>
          <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Asset & Session
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">
                Pair / Asset
              </Label>
              <Input
                placeholder="EURUSD, XAUUSD..."
                value={form.pair}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pair: e.target.value.toUpperCase() }))
                }
                className="font-mono bg-input/50 border-border/50 focus:border-win/50 focus:ring-win/20 uppercase"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">
                Session
              </Label>
              <Select
                value={form.session}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, session: v as Session }))
                }
              >
                <SelectTrigger className="bg-input/50 border-border/50 focus:border-win/50 font-body">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Session.asia}>Asia</SelectItem>
                  <SelectItem value={Session.london}>London</SelectItem>
                  <SelectItem value={Session.ny}>New York</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Section: Market Context */}
        <div>
          <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Market Context
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">
                Higher Timeframe Bias
              </Label>
              <Input
                placeholder="Bullish / Bearish / Range"
                value={form.htfBias}
                onChange={(e) =>
                  setForm((p) => ({ ...p, htfBias: e.target.value }))
                }
                className="bg-input/50 border-border/50 focus:border-win/50 focus:ring-win/20 font-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">
                Market Structure
              </Label>
              <Input
                placeholder="CHoCH / BOS / Premium / Discount..."
                value={form.marketStructure}
                onChange={(e) =>
                  setForm((p) => ({ ...p, marketStructure: e.target.value }))
                }
                className="bg-input/50 border-border/50 focus:border-win/50 focus:ring-win/20 font-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">
                Liquidity Target
              </Label>
              <Input
                placeholder="Buy-side / Sell-side / Equal Highs..."
                value={form.liquidityTarget}
                onChange={(e) =>
                  setForm((p) => ({ ...p, liquidityTarget: e.target.value }))
                }
                className="bg-input/50 border-border/50 focus:border-win/50 focus:ring-win/20 font-body"
              />
            </div>
          </div>
        </div>

        {/* Section: Entry Model */}
        <div>
          <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Entry Model
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">
                Point of Interest (OB / FVG / Supply / Demand)
              </Label>
              <Input
                placeholder="Bullish OB at 1.0850 / FVG fill..."
                value={form.poi}
                onChange={(e) =>
                  setForm((p) => ({ ...p, poi: e.target.value }))
                }
                className="bg-input/50 border-border/50 focus:border-win/50 focus:ring-win/20 font-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">
                Entry Confirmation
              </Label>
              <Input
                placeholder="M1 CHoCH / Engulfing / MSS..."
                value={form.entryConfirmation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, entryConfirmation: e.target.value }))
                }
                className="bg-input/50 border-border/50 focus:border-win/50 focus:ring-win/20 font-body"
              />
            </div>
          </div>
        </div>

        {/* Section: Targets */}
        <div>
          <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Targets & Quality
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">
                RR Target
              </Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="2.0"
                value={form.rrTarget}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    rrTarget: Number.parseFloat(e.target.value) || 2,
                  }))
                }
                className="font-mono bg-input/50 border-border/50 focus:border-win/50 focus:ring-win/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body flex items-center justify-between">
                <span>Trade Quality Score</span>
                <span
                  className={`font-mono text-sm font-bold ${
                    form.qualityScore >= 7
                      ? "text-win"
                      : form.qualityScore >= 4
                        ? "text-be"
                        : "text-loss"
                  }`}
                >
                  {form.qualityScore}/10
                </span>
              </Label>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[form.qualityScore]}
                onValueChange={([v]) =>
                  setForm((p) => ({ ...p, qualityScore: v }))
                }
                className="mt-3"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          data-ocid="playbook.save.button"
          disabled={createEntry.isPending}
          className="w-full bg-win hover:bg-win/90 text-background font-body font-semibold rounded-xl h-11"
        >
          {createEntry.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Setup...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" /> Save Setup
            </>
          )}
        </Button>
      </motion.form>

      {/* Saved Entries */}
      <div data-ocid="playbook.list">
        <h2 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-win" />
          Saved Setups
          {entries && (
            <span className="text-xs text-muted-foreground font-body ml-1">
              ({entries.length})
            </span>
          )}
        </h2>

        {isLoading ? (
          <div className="space-y-3" data-ocid="playbook.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : !entries || entries.length === 0 ? (
          <div
            data-ocid="playbook.empty_state"
            className="glass-card rounded-2xl p-8 text-center"
          >
            <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No playbook entries yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Save your first setup above
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.id.toString()}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-foreground">
                        {entry.pair}
                      </span>
                      <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-win/10 text-win border border-win/20">
                        {SESSION_LABELS[entry.session] ?? entry.session}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          Number(entry.qualityScore) >= 7
                            ? "bg-win/10 text-win border-win/20"
                            : Number(entry.qualityScore) >= 4
                              ? "bg-be/10 text-be border-be/20"
                              : "bg-loss/10 text-loss border-loss/20"
                        }`}
                      >
                        {entry.qualityScore.toString()}/10
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-body truncate">
                      {entry.htfBias && (
                        <span className="mr-2">HTF: {entry.htfBias}</span>
                      )}
                      {entry.poi && <span>POI: {entry.poi}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground/70 font-body flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      RR {entry.rrTarget.toFixed(1)}R —{" "}
                      {entry.entryConfirmation || "No confirmation"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleteEntry.isPending}
                    className="text-muted-foreground/50 hover:text-loss hover:bg-loss/10 rounded-xl ml-2 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
