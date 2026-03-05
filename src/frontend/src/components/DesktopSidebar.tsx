import {
  BarChart3,
  BookOpen,
  Calculator,
  History,
  LayoutDashboard,
  PenLine,
} from "lucide-react";
import { motion } from "motion/react";
import type { NavTab } from "../App";

const navItems: {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "playbook", label: "Playbook", icon: BookOpen },
  { id: "journal", label: "Journal", icon: PenLine },
  { id: "history", label: "Trade History", icon: History },
  { id: "calculator", label: "Risk Calc", icon: Calculator },
  { id: "performance", label: "Performance", icon: BarChart3 },
];

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export default function DesktopSidebar({ activeTab, onTabChange }: Props) {
  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 border-r border-border/40 bg-sidebar">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-win to-win/40 flex items-center justify-center animate-pulse-glow shadow-glow">
            <span className="text-sm font-display font-black text-background">
              S
            </span>
          </div>
          <div>
            <div className="text-sm font-display font-bold text-foreground leading-tight">
              SMC Trader
            </div>
            <div className="text-[10px] font-mono text-win/80 tracking-widest uppercase">
              Elite
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => onTabChange(item.id)}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-200 relative ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-win/10 to-win/5 border border-win/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon
                className={`w-4 h-4 relative z-10 ${isActive ? "text-win" : ""}`}
              />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <div className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-win" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border/40">
        <div className="text-[10px] text-muted-foreground/50 text-center font-body">
          © {new Date().getFullYear()} — Built with{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-win/60 hover:text-win transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </aside>
  );
}
