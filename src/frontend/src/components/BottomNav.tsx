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
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "playbook", label: "Playbook", icon: BookOpen },
  { id: "journal", label: "Journal", icon: PenLine },
  { id: "history", label: "History", icon: History },
  { id: "calculator", label: "Risk", icon: Calculator },
  { id: "performance", label: "Stats", icon: BarChart3 },
];

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 safe-bottom">
      <div className="glass-card border-t border-border/40 px-1 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => onTabChange(item.id)}
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
        </div>
      </div>
    </nav>
  );
}
