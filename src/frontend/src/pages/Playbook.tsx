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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit2,
  Eye,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PlaybookEntry } from "../backend.d";
import { Session } from "../backend.d";
import {
  useAllPlaybookEntries,
  useCreatePlaybookEntry,
  useDeletePlaybookEntry,
  useUpdatePlaybookEntry,
} from "../hooks/useQueries";

// ─── Custom Playbook Types & Helpers ─────────────────────────────────────────

const CUSTOM_STORAGE_KEY = "smc-custom-playbooks";

interface CustomField {
  label: string;
  value: string;
}

interface CustomPlaybook {
  id: string;
  name: string;
  assetSession: string;
  marketContext: string;
  entryModel: string;
  targetsQuality: string;
  customFields: CustomField[];
  createdAt: number;
}

function loadCustomPlaybooks(): CustomPlaybook[] {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CustomPlaybook[];
  } catch {}
  return [];
}

function saveCustomPlaybooks(items: CustomPlaybook[]) {
  try {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function useCustomPlaybooks() {
  const [items, setItems] = useState<CustomPlaybook[]>(() =>
    loadCustomPlaybooks(),
  );

  const save = (item: Omit<CustomPlaybook, "id" | "createdAt">) => {
    const newItem: CustomPlaybook = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const next = [...loadCustomPlaybooks(), newItem];
    saveCustomPlaybooks(next);
    setItems(next);
    return newItem;
  };

  const remove = (id: string) => {
    const next = loadCustomPlaybooks().filter((i) => i.id !== id);
    saveCustomPlaybooks(next);
    setItems(next);
  };

  return { items, save, remove };
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: "1px solid oklch(var(--border) / 0.4)",
        background: "oklch(var(--muted) / 0.2)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent/20 transition-colors"
      >
        <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground/60" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground/60" />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ─── Custom Builder Tab ───────────────────────────────────────────────────────

function CustomBuilderTab() {
  const { items, save, remove } = useCustomPlaybooks();
  const [viewItem, setViewItem] = useState<CustomPlaybook | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const defaultForm = {
    name: "",
    assetSession: "",
    marketContext: "",
    entryModel: "",
    targetsQuality: "",
    customFields: [] as CustomField[],
  };

  const [form, setForm] = useState(defaultForm);

  const addCustomField = () => {
    setForm((p) => ({
      ...p,
      customFields: [...p.customFields, { label: "", value: "" }],
    }));
  };

  const updateCustomField = (
    i: number,
    key: keyof CustomField,
    val: string,
  ) => {
    setForm((p) => {
      const next = [...p.customFields];
      next[i] = { ...next[i], [key]: val };
      return { ...p, customFields: next };
    });
  };

  const removeCustomField = (i: number) => {
    setForm((p) => ({
      ...p,
      customFields: p.customFields.filter((_, idx) => idx !== i),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Template name is required");
      return;
    }
    save({
      name: form.name.trim(),
      assetSession: form.assetSession.trim(),
      marketContext: form.marketContext.trim(),
      entryModel: form.entryModel.trim(),
      targetsQuality: form.targetsQuality.trim(),
      customFields: form.customFields.filter(
        (f) => f.label.trim() || f.value.trim(),
      ),
    });
    toast.success("Custom playbook template saved!");
    setForm(defaultForm);
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* ── Create Form */}
      <motion.form
        onSubmit={handleSave}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-2xl p-5 space-y-4"
        data-ocid="custom_playbook.form.section"
      >
        <h2 className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
          <Wrench className="w-4 h-4 text-win" />
          Create Custom Template
        </h2>

        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-body uppercase tracking-wider">
            Template Name <span className="text-loss">*</span>
          </Label>
          <Input
            data-ocid="custom_playbook.name.input"
            placeholder="e.g. Gold OB Scalp, NASDAQ FVG Model…"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="h-11 rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body"
          />
        </div>

        {/* Asset & Session */}
        <CollapsibleSection title="Asset & Session" defaultOpen>
          <Textarea
            data-ocid="custom_playbook.asset_session.textarea"
            placeholder="Asset, trading session, timing, correlation notes…"
            value={form.assetSession}
            onChange={(e) =>
              setForm((p) => ({ ...p, assetSession: e.target.value }))
            }
            rows={3}
            className="mt-2 rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body resize-none"
          />
        </CollapsibleSection>

        {/* Market Context */}
        <CollapsibleSection title="Market Context">
          <Textarea
            data-ocid="custom_playbook.market_context.textarea"
            placeholder="HTF bias, market structure, liquidity, session context…"
            value={form.marketContext}
            onChange={(e) =>
              setForm((p) => ({ ...p, marketContext: e.target.value }))
            }
            rows={3}
            className="mt-2 rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body resize-none"
          />
        </CollapsibleSection>

        {/* Entry Model */}
        <CollapsibleSection title="Entry Model">
          <Textarea
            data-ocid="custom_playbook.entry_model.textarea"
            placeholder="POI, confirmation, entry type, timeframe confirmation…"
            value={form.entryModel}
            onChange={(e) =>
              setForm((p) => ({ ...p, entryModel: e.target.value }))
            }
            rows={3}
            className="mt-2 rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body resize-none"
          />
        </CollapsibleSection>

        {/* Targets & Quality */}
        <CollapsibleSection title="Targets & Quality">
          <Textarea
            data-ocid="custom_playbook.targets.textarea"
            placeholder="RR target, TP levels, SL placement, quality criteria…"
            value={form.targetsQuality}
            onChange={(e) =>
              setForm((p) => ({ ...p, targetsQuality: e.target.value }))
            }
            rows={3}
            className="mt-2 rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body resize-none"
          />
        </CollapsibleSection>

        {/* Custom Fields */}
        {form.customFields.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
              Custom Fields
            </h4>
            {form.customFields.map((field, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: custom fields list is user-managed, index is stable during editing
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Field label"
                  value={field.label}
                  onChange={(e) =>
                    updateCustomField(i, "label", e.target.value)
                  }
                  className="flex-1 h-9 rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body text-sm"
                />
                <Input
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) =>
                    updateCustomField(i, "value", e.target.value)
                  }
                  className="flex-1 h-9 rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body text-sm"
                />
                <Button
                  type="button"
                  data-ocid="custom_playbook.field.delete_button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeCustomField(i)}
                  className="h-9 w-9 p-0 rounded-xl text-muted-foreground/60 hover:text-loss hover:bg-loss/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add Custom Field */}
        <Button
          type="button"
          data-ocid="custom_playbook.add_field.button"
          variant="ghost"
          onClick={addCustomField}
          className="w-full h-9 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all border border-dashed border-border/40 gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Custom Field
        </Button>

        <Button
          type="submit"
          data-ocid="custom_playbook.save.button"
          className="w-full h-11 rounded-xl font-display font-semibold text-sm"
          style={{
            background:
              "linear-gradient(135deg, oklch(var(--win)) 0%, oklch(var(--win) / 0.7) 100%)",
            color: "oklch(0.1 0.008 255)",
            border: "none",
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Save Template
        </Button>
      </motion.form>

      {/* ── Saved Templates */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-win" />
          Saved Templates
          {items.length > 0 && (
            <span className="text-xs text-muted-foreground font-body ml-1">
              ({items.length})
            </span>
          )}
        </h2>

        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-ocid="custom_playbook.empty_state"
              className="glass-card rounded-2xl p-8 text-center"
            >
              <Wrench className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No custom templates yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Create your first template above
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const markerIdx = idx + 1;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.25) }}
                    data-ocid={
                      markerIdx <= 3
                        ? `custom_playbook.item.${markerIdx}`
                        : undefined
                    }
                    className="glass-card rounded-2xl p-4 hover:border-win/20 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-semibold text-foreground text-sm truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-body mt-0.5">
                          {formatDate(item.createdAt)}
                        </div>
                        {item.entryModel && (
                          <p className="text-xs text-muted-foreground/70 font-body mt-1.5 line-clamp-2">
                            {item.entryModel}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 ml-3 shrink-0">
                        <Button
                          type="button"
                          data-ocid={
                            markerIdx <= 3
                              ? `custom_playbook.use.button.${markerIdx}`
                              : undefined
                          }
                          size="sm"
                          onClick={() => {
                            setViewItem(item);
                            setViewOpen(true);
                          }}
                          className="h-8 px-3 rounded-xl text-xs font-body font-semibold"
                          style={{
                            background: "oklch(var(--win) / 0.1)",
                            color: "oklch(var(--win))",
                            border: "1px solid oklch(var(--win) / 0.2)",
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Use
                        </Button>
                        <Button
                          type="button"
                          data-ocid={
                            markerIdx <= 3
                              ? `custom_playbook.delete_button.${markerIdx}`
                              : undefined
                          }
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            remove(item.id);
                            toast.success("Template deleted");
                          }}
                          className="h-8 w-8 p-0 rounded-xl text-muted-foreground/60 hover:text-loss hover:bg-loss/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Template Detail Sheet */}
      <Sheet open={viewOpen} onOpenChange={(v) => !v && setViewOpen(false)}>
        <SheetContent
          data-ocid="custom_playbook.dialog"
          className="w-full sm:max-w-lg overflow-y-auto flex flex-col"
          style={{
            background: "oklch(var(--card) / 0.97)",
            backdropFilter: "blur(40px)",
            borderLeft: "1px solid oklch(var(--border) / 0.5)",
          }}
        >
          {viewItem && (
            <>
              <SheetHeader className="shrink-0 pb-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "oklch(var(--win) / 0.12)",
                      border: "1px solid oklch(var(--win) / 0.25)",
                    }}
                  >
                    <Wrench className="w-5 h-5 text-win" />
                  </div>
                  <div>
                    <SheetTitle className="text-foreground font-display text-base leading-tight">
                      {viewItem.name}
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground text-xs font-body mt-0.5">
                      Custom Playbook Template
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 py-4 space-y-4">
                {[
                  {
                    label: "Asset & Session",
                    value: viewItem.assetSession,
                  },
                  { label: "Market Context", value: viewItem.marketContext },
                  { label: "Entry Model", value: viewItem.entryModel },
                  {
                    label: "Targets & Quality",
                    value: viewItem.targetsQuality,
                  },
                ]
                  .filter((s) => s.value)
                  .map((section) => (
                    <div
                      key={section.label}
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(var(--muted) / 0.25)",
                        border: "1px solid oklch(var(--border) / 0.3)",
                      }}
                    >
                      <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {section.label}
                      </h4>
                      <p className="text-sm text-foreground font-body leading-relaxed whitespace-pre-wrap">
                        {section.value}
                      </p>
                    </div>
                  ))}

                {viewItem.customFields.filter((f) => f.label || f.value)
                  .length > 0 && (
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: "oklch(var(--muted) / 0.25)",
                      border: "1px solid oklch(var(--border) / 0.3)",
                    }}
                  >
                    <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Custom Fields
                    </h4>
                    <div className="space-y-2">
                      {viewItem.customFields
                        .filter((f) => f.label || f.value)
                        .map((f) => (
                          <div
                            key={`${f.label}-${f.value}`}
                            className="flex items-start justify-between gap-3 py-1.5 border-b border-border/20 last:border-0"
                          >
                            <span className="text-xs font-body text-muted-foreground shrink-0 w-32">
                              {f.label || "—"}
                            </span>
                            <span className="text-sm font-body text-foreground text-right flex-1">
                              {f.value || "—"}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 pt-4 border-t border-border/30">
                <Button
                  data-ocid="custom_playbook.close.button"
                  onClick={() => setViewOpen(false)}
                  variant="ghost"
                  className="w-full h-10 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

type SheetMode = "view" | "edit";

// ─── Quality score color helper ───────────────────────────────────────────────

function qualityClass(score: number) {
  if (score >= 7) return "text-win";
  if (score >= 4) return "text-be";
  return "text-loss";
}

function qualityBadgeClass(score: number) {
  if (score >= 7) return "bg-win/10 text-win border-win/20";
  if (score >= 4) return "bg-be/10 text-be border-be/20";
  return "bg-loss/10 text-loss border-loss/20";
}

// ─── Read-only field row ──────────────────────────────────────────────────────

function ViewField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border/30 last:border-0">
      <span className="text-xs font-body text-muted-foreground shrink-0 pt-0.5 w-40">
        {label}
      </span>
      <span
        className={`text-sm text-right ${mono ? "font-mono" : "font-body"} text-foreground flex-1`}
      >
        {value || <span className="text-muted-foreground/40 italic">—</span>}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function StandardPlaybookTab() {
  const [form, setForm] = useState(defaultForm);

  // ── Sheet state
  const [selectedEntry, setSelectedEntry] = useState<PlaybookEntry | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("view");

  // ── Edit form state (within sheet)
  const [editForm, setEditForm] = useState({
    pair: "",
    session: "" as Session | "",
    htfBias: "",
    marketStructure: "",
    liquidityTarget: "",
    poi: "",
    entryConfirmation: "",
    rrTarget: 2,
    qualityScore: 7,
  });

  // ── Queries / Mutations
  const { data: entries, isLoading } = useAllPlaybookEntries();
  const createEntry = useCreatePlaybookEntry();
  const deleteEntry = useDeletePlaybookEntry();
  const updateEntry = useUpdatePlaybookEntry();

  // ── Create entry
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

  // ── Open sheet for entry
  const openEntry = (entry: PlaybookEntry) => {
    setSelectedEntry(entry);
    setSheetMode("view");
    setSheetOpen(true);
  };

  // ── Enter edit mode
  const enterEditMode = () => {
    if (!selectedEntry) return;
    setEditForm({
      pair: selectedEntry.pair,
      session: selectedEntry.session,
      htfBias: selectedEntry.htfBias,
      marketStructure: selectedEntry.marketStructure,
      liquidityTarget: selectedEntry.liquidityTarget,
      poi: selectedEntry.poi,
      entryConfirmation: selectedEntry.entryConfirmation,
      rrTarget: selectedEntry.rrTarget,
      qualityScore: Number(selectedEntry.qualityScore),
    });
    setSheetMode("edit");
  };

  // ── Save edited entry
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;
    if (!editForm.session) {
      toast.error("Please select a session");
      return;
    }
    try {
      const updated: PlaybookEntry = {
        ...selectedEntry,
        pair: editForm.pair,
        session: editForm.session as Session,
        htfBias: editForm.htfBias,
        marketStructure: editForm.marketStructure,
        liquidityTarget: editForm.liquidityTarget,
        poi: editForm.poi,
        entryConfirmation: editForm.entryConfirmation,
        rrTarget: editForm.rrTarget,
        qualityScore: BigInt(editForm.qualityScore),
      };
      await updateEntry.mutateAsync(updated);
      toast.success("Setup updated");
      setSheetOpen(false);
      setSelectedEntry(null);
    } catch {
      toast.error("Failed to update setup");
    }
  };

  // ── Delete entry
  const handleDelete = async () => {
    if (!selectedEntry) return;
    try {
      await deleteEntry.mutateAsync(selectedEntry.id);
      toast.success("Entry deleted");
      setSheetOpen(false);
      setSelectedEntry(null);
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── New Setup Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card rounded-2xl p-5 space-y-5"
        data-ocid="playbook.form.section"
      >
        {/* Asset & Session */}
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
                data-ocid="playbook.pair.input"
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
                <SelectTrigger
                  data-ocid="playbook.session.select"
                  className="bg-input/50 border-border/50 focus:border-win/50 font-body"
                >
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

        {/* Market Context */}
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
                data-ocid="playbook.htfbias.input"
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
                data-ocid="playbook.structure.input"
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
                data-ocid="playbook.liquidity.input"
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

        {/* Entry Model */}
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
                data-ocid="playbook.poi.input"
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
                data-ocid="playbook.confirmation.input"
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

        {/* Targets & Quality */}
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
                data-ocid="playbook.rrtarget.input"
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
                  className={`font-mono text-sm font-bold ${qualityClass(form.qualityScore)}`}
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

      {/* ── Saved Entries */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        data-ocid="playbook.list"
      >
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
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {entries.map((entry, idx) => {
                const markerIdx = idx + 1;
                return (
                  <motion.button
                    key={entry.id.toString()}
                    type="button"
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                    data-ocid={
                      markerIdx <= 3 ? `playbook.item.${markerIdx}` : undefined
                    }
                    onClick={() => openEntry(entry)}
                    className="w-full text-left glass-card rounded-2xl p-4 hover:border-win/30 hover:bg-win/5 transition-all cursor-pointer group"
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
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${qualityBadgeClass(Number(entry.qualityScore))}`}
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
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-win/60 transition-colors mt-1 ml-2 shrink-0" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* ── Entry Detail / Edit Sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSelectedEntry(null);
        }}
      >
        <SheetContent
          data-ocid="playbook.dialog"
          className="w-full sm:max-w-lg overflow-y-auto flex flex-col"
          style={{
            background: "oklch(var(--card) / 0.97)",
            backdropFilter: "blur(40px)",
            borderLeft: "1px solid oklch(var(--border) / 0.5)",
          }}
        >
          {selectedEntry && (
            <>
              <SheetHeader className="shrink-0 pb-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-mono font-bold border ${qualityBadgeClass(Number(selectedEntry.qualityScore))}`}
                  >
                    {selectedEntry.qualityScore.toString()}
                  </div>
                  <div>
                    <SheetTitle className="text-foreground font-display text-base leading-tight">
                      {selectedEntry.pair}{" "}
                      <span className="text-win/70 font-body text-sm font-normal">
                        {SESSION_LABELS[selectedEntry.session] ??
                          selectedEntry.session}
                      </span>
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground text-xs font-body mt-0.5">
                      {sheetMode === "view"
                        ? "Playbook setup — tap Edit to modify"
                        : "Edit setup details below"}
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
                      className="space-y-3"
                    >
                      <div className="glass-card rounded-xl p-4 space-y-0.5">
                        <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Asset & Session
                        </h4>
                        <ViewField
                          label="Pair / Asset"
                          value={selectedEntry.pair}
                          mono
                        />
                        <ViewField
                          label="Session"
                          value={
                            SESSION_LABELS[selectedEntry.session] ??
                            selectedEntry.session
                          }
                        />
                      </div>

                      <div className="glass-card rounded-xl p-4 space-y-0.5">
                        <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Market Context
                        </h4>
                        <ViewField
                          label="HTF Bias"
                          value={selectedEntry.htfBias}
                        />
                        <ViewField
                          label="Market Structure"
                          value={selectedEntry.marketStructure}
                        />
                        <ViewField
                          label="Liquidity Target"
                          value={selectedEntry.liquidityTarget}
                        />
                      </div>

                      <div className="glass-card rounded-xl p-4 space-y-0.5">
                        <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Entry Model
                        </h4>
                        <ViewField
                          label="Point of Interest"
                          value={selectedEntry.poi}
                        />
                        <ViewField
                          label="Entry Confirmation"
                          value={selectedEntry.entryConfirmation}
                        />
                      </div>

                      <div className="glass-card rounded-xl p-4 space-y-0.5">
                        <h4 className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Targets & Quality
                        </h4>
                        <ViewField
                          label="RR Target"
                          value={`${selectedEntry.rrTarget.toFixed(1)}R`}
                          mono
                        />
                        <div className="flex items-center justify-between py-2.5">
                          <span className="text-xs font-body text-muted-foreground w-40 shrink-0">
                            Trade Quality Score
                          </span>
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <div className="flex-1 max-w-24 h-1.5 rounded-full bg-border/40 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  Number(selectedEntry.qualityScore) >= 7
                                    ? "bg-win"
                                    : Number(selectedEntry.qualityScore) >= 4
                                      ? "bg-be"
                                      : "bg-loss"
                                }`}
                                style={{
                                  width: `${(Number(selectedEntry.qualityScore) / 10) * 100}%`,
                                }}
                              />
                            </div>
                            <span
                              className={`font-mono text-sm font-bold ${qualityClass(Number(selectedEntry.qualityScore))}`}
                            >
                              {selectedEntry.qualityScore.toString()}/10
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── Edit Mode */
                    <motion.form
                      key="edit"
                      id="edit-playbook-form"
                      onSubmit={handleEditSave}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Asset & Session */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Pair / Asset
                          </Label>
                          <Input
                            data-ocid="playbook.edit.pair.input"
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
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Session
                          </Label>
                          <Select
                            value={editForm.session}
                            onValueChange={(v) =>
                              setEditForm((p) => ({
                                ...p,
                                session: v as Session,
                              }))
                            }
                          >
                            <SelectTrigger
                              data-ocid="playbook.edit.session.select"
                              className="bg-input/50 border-border/50 focus:border-win/50 font-body"
                            >
                              <SelectValue placeholder="Select session" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={Session.asia}>Asia</SelectItem>
                              <SelectItem value={Session.london}>
                                London
                              </SelectItem>
                              <SelectItem value={Session.ny}>
                                New York
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Market Context */}
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Higher Timeframe Bias
                          </Label>
                          <Input
                            data-ocid="playbook.edit.htfbias.input"
                            value={editForm.htfBias}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                htfBias: e.target.value,
                              }))
                            }
                            className="bg-input/50 border-border/50 focus:border-win/50 font-body"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Market Structure
                          </Label>
                          <Input
                            data-ocid="playbook.edit.structure.input"
                            value={editForm.marketStructure}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                marketStructure: e.target.value,
                              }))
                            }
                            className="bg-input/50 border-border/50 focus:border-win/50 font-body"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Liquidity Target
                          </Label>
                          <Input
                            data-ocid="playbook.edit.liquidity.input"
                            value={editForm.liquidityTarget}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                liquidityTarget: e.target.value,
                              }))
                            }
                            className="bg-input/50 border-border/50 focus:border-win/50 font-body"
                          />
                        </div>
                      </div>

                      {/* Entry Model */}
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Point of Interest
                          </Label>
                          <Input
                            data-ocid="playbook.edit.poi.input"
                            value={editForm.poi}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                poi: e.target.value,
                              }))
                            }
                            className="bg-input/50 border-border/50 focus:border-win/50 font-body"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            Entry Confirmation
                          </Label>
                          <Input
                            data-ocid="playbook.edit.confirmation.input"
                            value={editForm.entryConfirmation}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                entryConfirmation: e.target.value,
                              }))
                            }
                            className="bg-input/50 border-border/50 focus:border-win/50 font-body"
                          />
                        </div>
                      </div>

                      {/* Targets & Quality */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body">
                            RR Target
                          </Label>
                          <Input
                            data-ocid="playbook.edit.rrtarget.input"
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={editForm.rrTarget}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                rrTarget:
                                  Number.parseFloat(e.target.value) || 2,
                              }))
                            }
                            className="font-mono bg-input/50 border-border/50 focus:border-win/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground font-body flex items-center justify-between">
                            <span>Quality Score</span>
                            <span
                              className={`font-mono text-sm font-bold ${qualityClass(editForm.qualityScore)}`}
                            >
                              {editForm.qualityScore}/10
                            </span>
                          </Label>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[editForm.qualityScore]}
                            onValueChange={([v]) =>
                              setEditForm((p) => ({ ...p, qualityScore: v }))
                            }
                            className="mt-3"
                          />
                        </div>
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
                      data-ocid="playbook.edit_button"
                      onClick={enterEditMode}
                      className="flex-1 bg-win/10 hover:bg-win/20 text-win border border-win/20 hover:border-win/40 rounded-xl h-10 font-body font-semibold transition-all"
                    >
                      <Edit2 className="w-4 h-4 mr-2" /> Edit Setup
                    </Button>
                    <Button
                      type="button"
                      data-ocid="playbook.delete_button"
                      variant="ghost"
                      onClick={handleDelete}
                      disabled={deleteEntry.isPending}
                      className="h-10 px-4 rounded-xl text-muted-foreground/60 hover:text-loss hover:bg-loss/10 transition-all"
                    >
                      {deleteEntry.isPending ? (
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
                      form="edit-playbook-form"
                      data-ocid="playbook.edit.save_button"
                      disabled={updateEntry.isPending}
                      className="flex-1 bg-win hover:bg-win/90 text-background font-body font-semibold rounded-xl h-10"
                    >
                      {updateEntry.isPending ? (
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
                      data-ocid="playbook.edit.cancel_button"
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
    </div>
  );
}

// ─── Main Exported Component ──────────────────────────────────────────────────

export default function Playbook() {
  return (
    <section
      data-ocid="playbook.section"
      className="p-4 md:p-6 space-y-6 animate-fade-in max-w-2xl"
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          Playbook
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Pre-trade checklist & custom entry model builder
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="standard" className="w-full">
        <TabsList
          className="w-full grid grid-cols-2 rounded-xl h-10"
          style={{
            background: "oklch(var(--muted) / 0.4)",
            border: "1px solid oklch(var(--border) / 0.4)",
          }}
        >
          <TabsTrigger
            value="standard"
            data-ocid="playbook.standard.tab"
            className="rounded-lg text-sm font-body font-medium data-[state=active]:bg-win data-[state=active]:text-background transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 mr-2" />
            Standard
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            data-ocid="playbook.custom.tab"
            className="rounded-lg text-sm font-body font-medium data-[state=active]:bg-win data-[state=active]:text-background transition-all"
          >
            <Wrench className="w-3.5 h-3.5 mr-2" />
            Custom Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="mt-4">
          <StandardPlaybookTab />
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <CustomBuilderTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}
