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
import { Loader2, Sparkles, Target } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useSaveProfile } from "../hooks/useQueries";

interface ProfileSetupProps {
  onProfileSaved: () => void;
}

const TRADING_STYLES = [
  { value: "SMC", label: "Smart Money Concepts (SMC)" },
  { value: "ICT", label: "ICT Concepts" },
  { value: "Price Action", label: "Price Action" },
  { value: "Hybrid", label: "Hybrid" },
];

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
];

export default function ProfileSetup({ onProfileSaved }: ProfileSetupProps) {
  const [displayName, setDisplayName] = useState("");
  const [tradingStyle, setTradingStyle] = useState("");
  const [accountCurrency, setAccountCurrency] = useState("");
  const [bio, setBio] = useState("");

  const saveProfile = useSaveProfile();

  const isFormValid = displayName.trim() && tradingStyle && accountCurrency;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    await saveProfile.mutateAsync(
      {
        displayName: displayName.trim(),
        tradingStyle,
        accountCurrency,
        bio: bio.trim(),
      },
      {
        onSuccess: () => {
          onProfileSaved();
        },
      },
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background px-4 py-8">
      {/* Atmospheric background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.74 0.2 145 / 0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 110%, oklch(0.55 0.08 240 / 0.07) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, oklch(0.94 0.008 240) 0px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, oklch(0.94 0.008 240) 0px, transparent 1px, transparent 60px)",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo + Title */}
        <motion.div
          className="flex flex-col items-center gap-4 mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative">
            <div
              className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center animate-pulse-glow"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.74 0.2 145 / 0.9) 0%, oklch(0.55 0.15 145 / 0.7) 100%)",
                boxShadow:
                  "0 0 40px oklch(0.74 0.2 145 / 0.35), 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span className="font-display text-2xl font-bold text-background">
                S
              </span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight">
              Welcome to SMC Trader Elite
            </h1>
            <p className="mt-2 text-sm text-muted-foreground font-body">
              Set up your profile to get started
            </p>
          </div>
        </motion.div>

        {/* Setup Card */}
        <motion.div
          data-ocid="profile.setup_card"
          className="glass-card rounded-2xl p-6 md:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Card header */}
          <div className="flex items-center gap-2.5 mb-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.74 0.2 145 / 0.12)",
                border: "1px solid oklch(0.74 0.2 145 / 0.2)",
              }}
            >
              <Target className="w-4 h-4 win-text" />
            </div>
            <div>
              <h2 className="text-sm font-display font-semibold text-foreground">
                Trader Profile
              </h2>
              <p className="text-xs text-muted-foreground font-body">
                This helps personalise your experience
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="displayName"
                className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider"
              >
                Display Name <span className="text-loss">*</span>
              </Label>
              <Input
                data-ocid="profile.display_name_input"
                id="displayName"
                type="text"
                placeholder="e.g. John Trader"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoFocus
                className="h-11 rounded-xl bg-input/60 border-border/60 text-foreground placeholder:text-muted-foreground/50 font-body focus:border-win/50 focus:ring-win/20 transition-colors"
              />
            </div>

            {/* Trading Style */}
            <div className="space-y-1.5">
              <Label
                htmlFor="tradingStyle"
                className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider"
              >
                Trading Style <span className="text-loss">*</span>
              </Label>
              <Select value={tradingStyle} onValueChange={setTradingStyle}>
                <SelectTrigger
                  data-ocid="profile.trading_style_select"
                  id="tradingStyle"
                  className="h-11 rounded-xl bg-input/60 border-border/60 text-foreground font-body focus:border-win/50 focus:ring-win/20 transition-colors"
                >
                  <SelectValue placeholder="Select your style" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-popover border-border/60">
                  {TRADING_STYLES.map((style) => (
                    <SelectItem
                      key={style.value}
                      value={style.value}
                      className="font-body rounded-lg"
                    >
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Currency */}
            <div className="space-y-1.5">
              <Label
                htmlFor="accountCurrency"
                className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider"
              >
                Account Currency <span className="text-loss">*</span>
              </Label>
              <Select
                value={accountCurrency}
                onValueChange={setAccountCurrency}
              >
                <SelectTrigger
                  data-ocid="profile.account_currency_select"
                  id="accountCurrency"
                  className="h-11 rounded-xl bg-input/60 border-border/60 text-foreground font-body focus:border-win/50 focus:ring-win/20 transition-colors"
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-popover border-border/60">
                  {CURRENCIES.map((currency) => (
                    <SelectItem
                      key={currency.value}
                      value={currency.value}
                      className="font-body rounded-lg"
                    >
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bio / Trading Goal */}
            <div className="space-y-1.5">
              <Label
                htmlFor="bio"
                className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider"
              >
                Trading Goal{" "}
                <span className="text-muted-foreground/50 normal-case">
                  (optional)
                </span>
              </Label>
              <Textarea
                data-ocid="profile.bio_textarea"
                id="bio"
                placeholder="e.g. Grow my funded account to $100k using disciplined SMC setups..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="rounded-xl bg-input/60 border-border/60 text-foreground placeholder:text-muted-foreground/50 font-body resize-none focus:border-win/50 focus:ring-win/20 transition-colors"
              />
            </div>

            {/* Error state */}
            {saveProfile.isError && (
              <div
                data-ocid="profile.error_state"
                className="text-xs text-loss font-body px-3 py-2 rounded-lg"
                style={{
                  background: "oklch(0.62 0.22 22 / 0.08)",
                  border: "1px solid oklch(0.62 0.22 22 / 0.2)",
                }}
              >
                Failed to save profile. Please try again.
              </div>
            )}

            {/* Submit */}
            <Button
              data-ocid="profile.complete_setup_button"
              type="submit"
              disabled={!isFormValid || saveProfile.isPending}
              className="w-full h-12 rounded-xl font-display font-semibold text-sm tracking-wide transition-all duration-200 mt-2"
              style={{
                background:
                  !isFormValid || saveProfile.isPending
                    ? "oklch(0.74 0.2 145 / 0.35)"
                    : "linear-gradient(135deg, oklch(0.74 0.2 145) 0%, oklch(0.65 0.18 145) 100%)",
                color: "oklch(0.1 0.008 255)",
                boxShadow:
                  !isFormValid || saveProfile.isPending
                    ? "none"
                    : "0 4px 16px oklch(0.74 0.2 145 / 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                border: "none",
              }}
            >
              {saveProfile.isPending ? (
                <span
                  data-ocid="profile.complete_setup_button.loading_state"
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Complete Setup
                </span>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-muted-foreground/50 font-mono mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
