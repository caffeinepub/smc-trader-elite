import {
  BarChart3,
  BookOpen,
  Calculator,
  History,
  LayoutDashboard,
  MoreHorizontal,
  Network,
  PenLine,
  Settings,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { NavTab } from "../App";

const primaryNavItems: {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "playbook", label: "Playbook", icon: BookOpen },
  { id: "journal", label: "Journal", icon: PenLine },
  { id: "history", label: "History", icon: History },
  { id: "calculator", label: "Risk", icon: Calculator },
];

const moreNavItems: {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "performance", label: "Stats", icon: BarChart3 },
  { id: "strategies", label: "Strategies", icon: Star },
  { id: "network", label: "Network", icon: Network },
  { id: "settings", label: "Settings", icon: Settings },
];

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: Props) {
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreNavItems.some((item) => item.id === activeTab);

  const handleTabChange = (tab: NavTab) => {
    onTabChange(tab);
    setMoreOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="md:hidden fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More menu panel */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="more-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
            className="md:hidden fixed bottom-20 inset-x-4 z-50 rounded-2xl overflow-hidden"
            style={{
              background: "oklch(var(--card) / 0.97)",
              backdropFilter: "blur(40px)",
              border: "1px solid oklch(var(--border) / 0.6)",
              boxShadow:
                "0 -8px 32px rgba(0,0,0,0.4), 0 2px 0 rgba(255,255,255,0.04) inset",
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
                  More
                </span>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      data-ocid={`nav.${item.id}.link`}
                      onClick={() => handleTabChange(item.id)}
                      whileTap={{ scale: 0.9 }}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all"
                      style={{
                        background: isActive
                          ? "oklch(var(--win) / 0.12)"
                          : "oklch(var(--muted) / 0.3)",
                        border: isActive
                          ? "1px solid oklch(var(--win) / 0.3)"
                          : "1px solid transparent",
                      }}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-win" : "text-muted-foreground"}`}
                      />
                      <span
                        className={`text-[9px] font-body font-medium ${
                          isActive ? "text-win" : "text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 safe-bottom">
        <div className="glass-card border-t border-border/40 px-1 py-2">
          <div className="flex items-center justify-around">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  data-ocid={`nav.${item.id}.link`}
                  onClick={() => handleTabChange(item.id)}
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl min-w-[44px] min-h-[44px] justify-center transition-colors"
                >
                  <div
                    className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                      isActive ? "bg-win/15" : ""
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="bottom-nav-active"
                        className="absolute inset-0 rounded-xl bg-win/10 border border-win/20"
                        transition={{
                          type: "spring",
                          bounce: 0.3,
                          duration: 0.35,
                        }}
                      />
                    )}
                    <Icon
                      className={`w-4 h-4 relative z-10 transition-colors duration-200 ${
                        isActive ? "text-win" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[9px] font-body font-medium leading-none transition-colors duration-200 ${
                      isActive ? "text-win" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}

            {/* More button */}
            <motion.button
              type="button"
              data-ocid="nav.more.button"
              onClick={() => setMoreOpen((v) => !v)}
              whileTap={{ scale: 0.88 }}
              className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl min-w-[44px] min-h-[44px] justify-center transition-colors"
            >
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                  isMoreActive || moreOpen ? "bg-win/15" : ""
                }`}
              >
                {(isMoreActive || moreOpen) && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 rounded-xl bg-win/10 border border-win/20"
                    transition={{
                      type: "spring",
                      bounce: 0.3,
                      duration: 0.35,
                    }}
                  />
                )}
                <MoreHorizontal
                  className={`w-4 h-4 relative z-10 transition-colors duration-200 ${
                    isMoreActive || moreOpen
                      ? "text-win"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`text-[9px] font-body font-medium leading-none transition-colors duration-200 ${
                  isMoreActive || moreOpen
                    ? "text-win"
                    : "text-muted-foreground"
                }`}
              >
                More
              </span>
            </motion.button>
          </div>
        </div>
      </nav>
    </>
  );
}
