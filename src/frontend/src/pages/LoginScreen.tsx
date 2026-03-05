import { Button } from "@/components/ui/button";
import {
  BarChart2,
  BookOpen,
  Loader2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

const features = [
  { icon: TrendingUp, label: "Track equity curves" },
  { icon: BarChart2, label: "Analyse performance" },
  { icon: BookOpen, label: "Log every trade" },
];

export default function LoginScreen({
  onLogin,
  isLoggingIn,
}: LoginScreenProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.74 0.2 145 / 0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 20% 110%, oklch(0.55 0.08 240 / 0.07) 0%, transparent 60%)",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, oklch(0.94 0.008 240) 0px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, oklch(0.94 0.008 240) 0px, transparent 1px, transparent 60px)",
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm px-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo lockup */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative">
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-[22px] animate-pulse-glow"
              style={{ background: "transparent" }}
            />
            <div
              className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
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
            <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight leading-tight">
              SMC Trader Elite
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-body">
              Your professional trading journal
            </p>
          </div>
        </motion.div>

        {/* Glass card */}
        <motion.div
          className="w-full glass-card rounded-2xl p-6 flex flex-col gap-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Feature list */}
          <ul className="flex flex-col gap-3">
            {features.map(({ icon: Icon, label }, i) => (
              <motion.li
                key={label}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07, duration: 0.35 }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "oklch(0.74 0.2 145 / 0.12)",
                    border: "1px solid oklch(0.74 0.2 145 / 0.2)",
                  }}
                >
                  <Icon className="w-4 h-4 win-text" />
                </div>
                <span className="text-sm text-foreground/80 font-body">
                  {label}
                </span>
              </motion.li>
            ))}
          </ul>

          <div
            className="h-px"
            style={{ background: "oklch(var(--border) / 0.4)" }}
          />

          {/* Sign-in button */}
          <div className="flex flex-col gap-3">
            <Button
              data-ocid="login.primary_button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="w-full h-12 rounded-xl font-display font-semibold text-sm tracking-wide transition-all duration-200"
              style={{
                background: isLoggingIn
                  ? "oklch(0.74 0.2 145 / 0.4)"
                  : "linear-gradient(135deg, oklch(0.74 0.2 145) 0%, oklch(0.65 0.18 145) 100%)",
                color: "oklch(0.1 0.008 255)",
                boxShadow: isLoggingIn
                  ? "none"
                  : "0 4px 16px oklch(0.74 0.2 145 / 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                border: "none",
              }}
            >
              {isLoggingIn ? (
                <span
                  data-ocid="login.loading_state"
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Sign In with Internet Identity
                </span>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground font-body leading-relaxed">
              Secure, passwordless login powered by the Internet Computer.
              <br />
              Your data stays yours.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-xs text-muted-foreground/50 font-mono"
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
