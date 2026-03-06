import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = "dark" | "light" | "system" | "mixed";
export type FontStyle = "sf" | "geometric" | "mono" | "serif";
export type AnimationLevel = "full" | "reduced" | "none";

export interface AppSettings {
  theme: Theme;
  primaryColor: string;
  secondaryColor: string;
  fontStyle: FontStyle;
  animationLevel: AnimationLevel;
}

interface SettingsContextValue extends AppSettings {
  updateTheme: (theme: Theme) => void;
  updatePrimaryColor: (color: string) => void;
  updateSecondaryColor: (color: string) => void;
  updateFontStyle: (font: FontStyle) => void;
  updateAnimationLevel: (level: AnimationLevel) => void;
  resetToDefaults: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "smc-trader-settings";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  primaryColor: "0.74 0.2 145",
  secondaryColor: "0.65 0.18 210",
  fontStyle: "sf",
  animationLevel: "full",
};

// ─── Font family map ──────────────────────────────────────────────────────────

const FONT_FAMILIES: Record<FontStyle, string> = {
  sf: "Figtree, system-ui, sans-serif",
  geometric: "Outfit, system-ui, sans-serif",
  mono: "Geist Mono, monospace",
  serif: "Playfair Display, Georgia, serif",
};

// ─── Apply settings to DOM ───────────────────────────────────────────────────

function applySettings(settings: AppSettings) {
  const root = document.documentElement;

  // Theme
  root.setAttribute("data-theme", settings.theme);

  if (settings.theme === "light") {
    root.style.colorScheme = "light";
    root.style.setProperty("--background", "0.97 0.003 240");
    root.style.setProperty("--foreground", "0.12 0.012 255");
    root.style.setProperty("--card", "1 0 0");
    root.style.setProperty("--card-foreground", "0.12 0.012 255");
    root.style.setProperty("--popover", "0.98 0.003 240");
    root.style.setProperty("--popover-foreground", "0.12 0.012 255");
    root.style.setProperty("--muted", "0.94 0.005 240");
    root.style.setProperty("--muted-foreground", "0.5 0.02 240");
    root.style.setProperty("--border", "0.88 0.008 240");
    root.style.setProperty("--input", "0.92 0.005 240");
    root.style.setProperty("--accent", "0.92 0.008 240");
    root.style.setProperty("--accent-foreground", "0.12 0.012 255");
    root.style.setProperty("--secondary", "0.94 0.005 240");
    root.style.setProperty("--secondary-foreground", "0.3 0.02 240");
    root.style.setProperty("--sidebar", "0.95 0.004 240");
  } else if (settings.theme === "mixed") {
    root.style.colorScheme = "dark";
    root.style.setProperty("--background", "0.1 0.008 255");
    root.style.setProperty("--foreground", "0.94 0.008 240");
    root.style.setProperty("--card", "0.18 0.014 240");
    root.style.setProperty("--card-foreground", "0.92 0.008 240");
    root.style.setProperty("--popover", "0.2 0.014 240");
    root.style.setProperty("--popover-foreground", "0.94 0.008 240");
    root.style.setProperty("--muted", "0.22 0.015 240");
    root.style.setProperty("--muted-foreground", "0.55 0.018 240");
    root.style.setProperty("--border", "0.28 0.018 255");
    root.style.setProperty("--input", "0.22 0.015 255");
    root.style.setProperty("--accent", "0.24 0.018 255");
    root.style.setProperty("--accent-foreground", "0.88 0.015 240");
    root.style.setProperty("--secondary", "0.22 0.015 255");
    root.style.setProperty("--secondary-foreground", "0.78 0.015 240");
    root.style.setProperty("--sidebar", "0.13 0.012 255");
  } else {
    // dark or system (system defaults to dark since trading app)
    root.style.colorScheme = "dark";
    root.style.removeProperty("--background");
    root.style.removeProperty("--foreground");
    root.style.removeProperty("--card");
    root.style.removeProperty("--card-foreground");
    root.style.removeProperty("--popover");
    root.style.removeProperty("--popover-foreground");
    root.style.removeProperty("--muted");
    root.style.removeProperty("--muted-foreground");
    root.style.removeProperty("--border");
    root.style.removeProperty("--input");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-foreground");
    root.style.removeProperty("--secondary");
    root.style.removeProperty("--secondary-foreground");
    root.style.removeProperty("--sidebar");
  }

  // Colors
  root.style.setProperty("--win", settings.primaryColor);
  root.style.setProperty("--color-primary-custom", settings.primaryColor);
  root.style.setProperty("--color-secondary", settings.secondaryColor);
  root.style.setProperty("--be", settings.secondaryColor);
  root.style.setProperty("--chart-1", settings.primaryColor);
  root.style.setProperty("--sidebar-primary", settings.primaryColor);

  // Font
  const fontFamily = FONT_FAMILIES[settings.fontStyle];
  root.style.setProperty("--font-body", fontFamily);
  document.body.style.fontFamily = fontFamily;

  // Animation
  root.classList.remove("no-animation", "reduced-animation");
  if (settings.animationLevel === "none") {
    root.classList.add("no-animation");
  } else if (settings.animationLevel === "reduced") {
    root.classList.add("reduced-animation");
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Apply on mount + whenever settings change
  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const saveSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    applySettings(next);
  }, []);

  const updateTheme = useCallback(
    (theme: Theme) => saveSettings({ ...settings, theme }),
    [settings, saveSettings],
  );

  const updatePrimaryColor = useCallback(
    (primaryColor: string) => saveSettings({ ...settings, primaryColor }),
    [settings, saveSettings],
  );

  const updateSecondaryColor = useCallback(
    (secondaryColor: string) => saveSettings({ ...settings, secondaryColor }),
    [settings, saveSettings],
  );

  const updateFontStyle = useCallback(
    (fontStyle: FontStyle) => saveSettings({ ...settings, fontStyle }),
    [settings, saveSettings],
  );

  const updateAnimationLevel = useCallback(
    (animationLevel: AnimationLevel) =>
      saveSettings({ ...settings, animationLevel }),
    [settings, saveSettings],
  );

  const resetToDefaults = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        updateTheme,
        updatePrimaryColor,
        updateSecondaryColor,
        updateFontStyle,
        updateAnimationLevel,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
