import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  RotateCcw,
  Sun,
  Type,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import {
  type AnimationLevel,
  type FontStyle,
  type Theme,
  useSettings,
} from "../contexts/SettingsContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY_PRESETS = [
  { label: "Emerald", value: "0.74 0.2 145" },
  { label: "Sky Blue", value: "0.65 0.18 220" },
  { label: "Violet", value: "0.62 0.22 285" },
  { label: "Amber", value: "0.78 0.18 80" },
  { label: "Rose", value: "0.65 0.24 10" },
  { label: "Cyan", value: "0.72 0.18 195" },
  { label: "Orange", value: "0.72 0.2 55" },
  { label: "Teal", value: "0.7 0.18 175" },
];

const SECONDARY_PRESETS = [
  { label: "Indigo", value: "0.65 0.18 250" },
  { label: "Sky", value: "0.65 0.18 210" },
  { label: "Purple", value: "0.62 0.2 295" },
  { label: "Lime", value: "0.76 0.2 130" },
  { label: "Pink", value: "0.66 0.22 345" },
  { label: "Slate", value: "0.55 0.08 250" },
  { label: "Gold", value: "0.78 0.17 65" },
  { label: "Aqua", value: "0.73 0.17 185" },
];

const THEMES: {
  id: Theme;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    description: "Deep dark trading theme",
  },
  {
    id: "light",
    label: "Light",
    icon: Sun,
    description: "Clean bright surface",
  },
  {
    id: "system",
    label: "System",
    icon: Monitor,
    description: "Match OS preference",
  },
  {
    id: "mixed",
    label: "Mixed",
    icon: RefreshCw,
    description: "Dark bg, lighter cards",
  },
];

const FONTS: {
  id: FontStyle;
  label: string;
  preview: string;
  fontClass: string;
}[] = [
  {
    id: "sf",
    label: "SF Pro Style",
    preview: "The quick brown fox jumps",
    fontClass: "",
  },
  {
    id: "geometric",
    label: "Geometric",
    preview: "The quick brown fox jumps",
    fontClass: "font-geometric",
  },
  {
    id: "mono",
    label: "Monospace",
    preview: "01010 RR 2.5 EURUSD WIN",
    fontClass: "font-mono",
  },
  {
    id: "serif",
    label: "Serif",
    preview: "The quick brown fox jumps",
    fontClass: "font-serif",
  },
];

const ANIMATIONS: {
  id: AnimationLevel;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "full",
    label: "Full Animations",
    description: "All transitions and micro-interactions",
    icon: Zap,
  },
  {
    id: "reduced",
    label: "Reduced Motion",
    description: "Minimal, essential transitions only",
    icon: Zap,
  },
  {
    id: "none",
    label: "No Animations",
    description: "Static, instant UI updates",
    icon: Zap,
  },
];

// ─── Color Swatch ─────────────────────────────────────────────────────────────

function ColorSwatch({
  value,
  isActive,
  label,
  onClick,
  ocid,
}: {
  value: string;
  isActive: boolean;
  label: string;
  onClick: () => void;
  ocid?: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      title={label}
      className="relative w-8 h-8 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
      style={{ background: `oklch(${value})` }}
    >
      {isActive && (
        <span className="absolute inset-0 rounded-full ring-2 ring-white ring-offset-2 ring-offset-background flex items-center justify-center">
          <Check className="w-3 h-3 text-white drop-shadow" />
        </span>
      )}
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: "oklch(var(--win) / 0.12)",
            border: "1px solid oklch(var(--win) / 0.2)",
          }}
        >
          <Icon className="w-3.5 h-3.5 text-win" />
        </div>
        <h3 className="text-sm font-display font-semibold text-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ─── Live Preview Panel ───────────────────────────────────────────────────────

function LivePreview() {
  const { primaryColor, secondaryColor, fontStyle, theme } = useSettings();

  const fontMap: Record<FontStyle, string> = {
    sf: "Figtree, system-ui, sans-serif",
    geometric: "Outfit, system-ui, sans-serif",
    mono: "Geist Mono, monospace",
    serif: "Playfair Display, Georgia, serif",
  };

  const themeLabel: Record<Theme, string> = {
    dark: "Dark",
    light: "Light",
    system: "System",
    mixed: "Mixed",
  };

  return (
    <div
      className="glass-card rounded-2xl p-5"
      style={{ borderLeft: `3px solid oklch(${primaryColor})` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-semibold text-foreground">
          Live Preview
        </h3>
        <Badge
          className="text-[10px] font-body"
          style={{
            background: `oklch(${primaryColor} / 0.12)`,
            color: `oklch(${primaryColor})`,
            border: `1px solid oklch(${primaryColor} / 0.25)`,
          }}
        >
          {themeLabel[theme]}
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Mini stat card */}
        <div
          className="rounded-xl p-3 flex items-center justify-between"
          style={{
            background: `oklch(${primaryColor} / 0.08)`,
            border: `1px solid oklch(${primaryColor} / 0.2)`,
          }}
        >
          <span
            className="text-xs font-body text-muted-foreground"
            style={{ fontFamily: fontMap[fontStyle] }}
          >
            Win Rate
          </span>
          <span
            className="text-sm font-mono font-bold"
            style={{ color: `oklch(${primaryColor})` }}
          >
            68.4%
          </span>
        </div>

        {/* Mini chart bar */}
        <div className="flex items-end gap-1 h-8 px-1">
          {(
            [
              "bar-1",
              "bar-2",
              "bar-3",
              "bar-4",
              "bar-5",
              "bar-6",
              "bar-7",
            ] as const
          ).map((barId, i) => {
            const heights = [0.5, 0.8, 0.6, 1.0, 0.7, 0.9, 0.75];
            return (
              <div
                key={barId}
                className="flex-1 rounded-sm transition-all"
                style={{
                  height: `${(heights[i] ?? 0.5) * 100}%`,
                  background:
                    i % 3 === 0
                      ? `oklch(${primaryColor} / 0.7)`
                      : i % 3 === 1
                        ? `oklch(${secondaryColor} / 0.6)`
                        : "oklch(var(--border) / 0.5)",
                }}
              />
            );
          })}
        </div>

        {/* Sample text */}
        <p
          className="text-xs text-muted-foreground leading-relaxed"
          style={{ fontFamily: fontMap[fontStyle] }}
        >
          EURUSD London Session — OB retest at 1.0854 confirmed with M15 CHoCH.
        </p>

        {/* CTA button preview */}
        <div
          className="w-full h-8 rounded-lg flex items-center justify-center text-[11px] font-display font-semibold"
          style={{
            background: `linear-gradient(135deg, oklch(${primaryColor}) 0%, oklch(${primaryColor} / 0.7) 100%)`,
            color: "oklch(0.1 0.008 255)",
          }}
        >
          Save Setup
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Settings() {
  const {
    theme,
    primaryColor,
    secondaryColor,
    fontStyle,
    animationLevel,
    updateTheme,
    updatePrimaryColor,
    updateSecondaryColor,
    updateFontStyle,
    updateAnimationLevel,
    resetToDefaults,
  } = useSettings();

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay },
  });

  return (
    <section
      data-ocid="settings.section"
      className="p-4 md:p-6 space-y-6 max-w-2xl animate-fade-in"
    >
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          Appearance Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Personalise the look and feel of your trading journal
        </p>
      </motion.div>

      {/* Live Preview */}
      <motion.div {...fadeUp(0.05)}>
        <LivePreview />
      </motion.div>

      {/* Theme Section */}
      <motion.div {...fadeUp(0.1)}>
        <SectionCard title="Theme" icon={Moon}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {THEMES.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  data-ocid={"settings.theme.tab"}
                  onClick={() => updateTheme(t.id)}
                  className={`rounded-xl p-3 text-left transition-all duration-200 flex flex-col gap-2 ${
                    isActive
                      ? "border-win/60 bg-win/8"
                      : "border-border/40 bg-muted/30 hover:border-border hover:bg-muted/50"
                  }`}
                  style={{
                    border: isActive
                      ? "2px solid oklch(var(--win) / 0.6)"
                      : "1px solid oklch(var(--border) / 0.4)",
                  }}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? "bg-win/15" : "bg-muted/50"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-win" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-display font-semibold ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {t.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 font-body mt-0.5 leading-tight">
                      {t.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </motion.div>

      {/* Colors Section */}
      <motion.div {...fadeUp(0.15)}>
        <SectionCard title="Colors" icon={Palette}>
          <div className="space-y-5">
            {/* Primary Color */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-display font-semibold text-foreground">
                    Primary Accent
                  </div>
                  <div className="text-[11px] text-muted-foreground font-body">
                    Used for wins, highlights, CTAs
                  </div>
                </div>
                <div
                  className="w-6 h-6 rounded-full border-2 border-white/20"
                  style={{ background: `oklch(${primaryColor})` }}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {PRIMARY_PRESETS.map((preset, i) => (
                  <ColorSwatch
                    key={preset.value}
                    value={preset.value}
                    label={preset.label}
                    isActive={primaryColor === preset.value}
                    onClick={() => updatePrimaryColor(preset.value)}
                    ocid={i === 0 ? "settings.primary_color.button" : undefined}
                  />
                ))}
              </div>
            </div>

            <Separator className="bg-border/30" />

            {/* Secondary Color */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-display font-semibold text-foreground">
                    Secondary Accent
                  </div>
                  <div className="text-[11px] text-muted-foreground font-body">
                    Used for secondary accents and breakeven
                  </div>
                </div>
                <div
                  className="w-6 h-6 rounded-full border-2 border-white/20"
                  style={{ background: `oklch(${secondaryColor})` }}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {SECONDARY_PRESETS.map((preset, i) => (
                  <ColorSwatch
                    key={preset.value}
                    value={preset.value}
                    label={preset.label}
                    isActive={secondaryColor === preset.value}
                    onClick={() => updateSecondaryColor(preset.value)}
                    ocid={
                      i === 0 ? "settings.secondary_color.button" : undefined
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Typography Section */}
      <motion.div {...fadeUp(0.2)}>
        <SectionCard title="Typography" icon={Type}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FONTS.map((font) => {
              const isActive = fontStyle === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  data-ocid="settings.font.button"
                  onClick={() => updateFontStyle(font.id)}
                  className={
                    "rounded-xl p-3 text-left transition-all duration-200"
                  }
                  style={{
                    border: isActive
                      ? "2px solid oklch(var(--win) / 0.6)"
                      : "1px solid oklch(var(--border) / 0.4)",
                    background: isActive
                      ? "oklch(var(--win) / 0.05)"
                      : "oklch(var(--muted) / 0.3)",
                  }}
                >
                  <div
                    className={`text-xs font-body font-semibold mb-1.5 ${isActive ? "text-win" : "text-muted-foreground"}`}
                  >
                    {font.label}
                  </div>
                  <div
                    className={
                      "text-sm text-foreground/80 leading-snug truncate"
                    }
                    style={{
                      fontFamily:
                        font.id === "sf"
                          ? "Figtree, system-ui, sans-serif"
                          : font.id === "geometric"
                            ? "Outfit, system-ui, sans-serif"
                            : font.id === "mono"
                              ? "Geist Mono, monospace"
                              : "Playfair Display, Georgia, serif",
                    }}
                  >
                    {font.preview}
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </motion.div>

      {/* Motion Section */}
      <motion.div {...fadeUp(0.25)}>
        <SectionCard title="Motion" icon={Zap}>
          <div className="space-y-2">
            {ANIMATIONS.map((anim) => {
              const isActive = animationLevel === anim.id;
              return (
                <button
                  key={anim.id}
                  type="button"
                  data-ocid="settings.animation.button"
                  onClick={() => updateAnimationLevel(anim.id)}
                  className="w-full flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200"
                  style={{
                    border: isActive
                      ? "2px solid oklch(var(--win) / 0.5)"
                      : "1px solid oklch(var(--border) / 0.4)",
                    background: isActive
                      ? "oklch(var(--win) / 0.07)"
                      : "oklch(var(--muted) / 0.25)",
                  }}
                >
                  <div className="text-left">
                    <div
                      className={`text-sm font-display font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {anim.label}
                    </div>
                    <div className="text-xs text-muted-foreground font-body mt-0.5">
                      {anim.description}
                    </div>
                  </div>
                  {isActive && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-3"
                      style={{ background: "oklch(var(--win))" }}
                    >
                      <Check className="w-3 h-3 text-background" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </SectionCard>
      </motion.div>

      {/* Reset Button */}
      <motion.div {...fadeUp(0.3)} className="pb-4">
        <Button
          type="button"
          data-ocid="settings.reset.button"
          variant="ghost"
          onClick={resetToDefaults}
          className="w-full h-11 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all border border-border/30 gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </Button>
      </motion.div>
    </section>
  );
}
