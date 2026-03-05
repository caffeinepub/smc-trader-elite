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
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import BottomNav from "./components/BottomNav";
import DesktopSidebar from "./components/DesktopSidebar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useProfile, useSaveProfile } from "./hooks/useQueries";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import LoginScreen from "./pages/LoginScreen";
import Performance from "./pages/Performance";
import Playbook from "./pages/Playbook";
import ProfileSetup from "./pages/ProfileSetup";
import RiskCalculator from "./pages/RiskCalculator";
import TradeHistory from "./pages/TradeHistory";

export type NavTab =
  | "dashboard"
  | "playbook"
  | "journal"
  | "history"
  | "calculator"
  | "performance";

const TRADING_STYLES = [
  { value: "SMC", label: "SMC" },
  { value: "ICT", label: "ICT" },
  { value: "Price Action", label: "Price Action" },
  { value: "Hybrid", label: "Hybrid" },
];

const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "JPY", label: "JPY" },
  { value: "AUD", label: "AUD" },
  { value: "CAD", label: "CAD" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editStyle, setEditStyle] = useState("");
  const [editCurrency, setEditCurrency] = useState("");
  const [editBio, setEditBio] = useState("");

  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: profile, isLoading: profileLoading } = useProfile();
  const saveProfile = useSaveProfile();

  const hasProfile = profile !== null && profile !== undefined;

  const handleLogout = () => {
    clear();
    queryClient.clear();
  };

  const openEditSheet = () => {
    if (profile) {
      setEditName(profile.displayName);
      setEditStyle(profile.tradingStyle);
      setEditCurrency(profile.accountCurrency);
      setEditBio(profile.bio);
    }
    setEditSheetOpen(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editStyle || !editCurrency) return;
    await saveProfile.mutateAsync(
      {
        displayName: editName.trim(),
        tradingStyle: editStyle,
        accountCurrency: editCurrency,
        bio: editBio.trim(),
      },
      {
        onSuccess: () => {
          setEditSheetOpen(false);
          toast.success("Profile updated");
        },
        onError: () => {
          toast.error("Failed to update profile");
        },
      },
    );
  };

  const handleProfileSaved = () => {
    void queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  // ── 1. Not authenticated → show login
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLogin={login} isLoggingIn={isLoggingIn} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(var(--card))",
              color: "oklch(var(--foreground))",
              border: "1px solid oklch(var(--border))",
            },
          }}
        />
      </>
    );
  }

  // ── 2. Authenticated but profile still loading → spinner
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          data-ocid="profile.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.74 0.2 145 / 0.9) 0%, oklch(0.55 0.15 145 / 0.7) 100%)",
              boxShadow: "0 0 24px oklch(0.74 0.2 145 / 0.3)",
            }}
          >
            <span className="font-display text-lg font-bold text-background">
              S
            </span>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // ── 3. Authenticated but no profile → show setup
  if (!hasProfile) {
    return (
      <>
        <ProfileSetup onProfileSaved={handleProfileSaved} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(var(--card))",
              color: "oklch(var(--foreground))",
              border: "1px solid oklch(var(--border))",
            },
          }}
        />
      </>
    );
  }

  // ── 4. Fully authenticated + profile exists → main app
  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "playbook":
        return <Playbook />;
      case "journal":
        return <Journal />;
      case "history":
        return <TradeHistory />;
      case "calculator":
        return <RiskCalculator />;
      case "performance":
        return <Performance />;
      default:
        return <Dashboard />;
    }
  };

  const isEditFormValid = editName.trim() && editStyle && editCurrency;
  const displayInitials = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "T";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 h-14 md:h-16 flex items-center px-4 md:px-6 border-b border-border/40 glass-card">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-win/80 to-win/40 flex items-center justify-center animate-pulse-glow">
              <span className="text-xs font-display font-bold text-background">
                S
              </span>
            </div>
            <span className="font-display font-semibold text-foreground tracking-tight">
              SMC Trader Elite
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* User name chip — clicking opens edit sheet */}
            <button
              type="button"
              data-ocid="profile.display_name_chip"
              onClick={openEditSheet}
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg transition-all duration-200 group"
              style={{
                background: "oklch(var(--card) / 0.5)",
                border: "1px solid oklch(var(--border) / 0.5)",
              }}
              title="Edit profile"
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-display font-bold flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.74 0.2 145 / 0.8) 0%, oklch(0.55 0.15 145 / 0.6) 100%)",
                  color: "oklch(0.1 0.008 255)",
                }}
              >
                {displayInitials}
              </div>
              <span className="text-xs font-body text-foreground/80 group-hover:text-foreground transition-colors max-w-[120px] truncate">
                {profile?.displayName}
              </span>
            </button>

            {/* Mobile edit profile button */}
            <Button
              data-ocid="profile.edit_button"
              variant="ghost"
              size="sm"
              onClick={openEditSheet}
              className="sm:hidden h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-lg"
              title="Edit profile"
            >
              <UserCircle2 className="w-4 h-4" />
            </Button>

            <Button
              data-ocid="header.logout_button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors rounded-lg gap-1.5"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs font-body">
                Sign out
              </span>
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-6">
          {renderPage()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Edit Profile Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent
          data-ocid="profile.edit_sheet"
          className="w-full sm:max-w-md glass-card border-border/50 overflow-y-auto"
          style={{
            background: "oklch(var(--card) / 0.95)",
            backdropFilter: "blur(32px)",
          }}
        >
          <SheetHeader className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.74 0.2 145 / 0.9) 0%, oklch(0.55 0.15 145 / 0.7) 100%)",
                  color: "oklch(0.1 0.008 255)",
                  boxShadow: "0 0 20px oklch(0.74 0.2 145 / 0.25)",
                }}
              >
                {displayInitials}
              </div>
              <div>
                <SheetTitle className="text-foreground font-display text-base leading-tight">
                  Edit Profile
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs font-body mt-0.5">
                  Update your trading preferences
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form onSubmit={handleEditSave} className="space-y-5">
            {/* Display Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="editDisplayName"
                className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider"
              >
                Display Name <span className="text-loss">*</span>
              </Label>
              <Input
                id="editDisplayName"
                type="text"
                placeholder="e.g. John Trader"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="h-11 rounded-xl bg-input/60 border-border/60 text-foreground placeholder:text-muted-foreground/50 font-body focus:border-win/50 focus:ring-win/20 transition-colors"
              />
            </div>

            {/* Trading Style */}
            <div className="space-y-1.5">
              <Label
                htmlFor="editTradingStyle"
                className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider"
              >
                Trading Style <span className="text-loss">*</span>
              </Label>
              <Select value={editStyle} onValueChange={setEditStyle}>
                <SelectTrigger
                  id="editTradingStyle"
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
                htmlFor="editAccountCurrency"
                className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider"
              >
                Account Currency <span className="text-loss">*</span>
              </Label>
              <Select value={editCurrency} onValueChange={setEditCurrency}>
                <SelectTrigger
                  id="editAccountCurrency"
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
                      {currency.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label
                htmlFor="editBio"
                className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider"
              >
                Trading Goal{" "}
                <span className="text-muted-foreground/50 normal-case">
                  (optional)
                </span>
              </Label>
              <Textarea
                data-ocid="profile.bio_textarea"
                id="editBio"
                placeholder="Your trading goals..."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="rounded-xl bg-input/60 border-border/60 text-foreground placeholder:text-muted-foreground/50 font-body resize-none focus:border-win/50 focus:ring-win/20 transition-colors"
              />
            </div>

            {/* Error */}
            {saveProfile.isError && (
              <div
                data-ocid="profile.error_state"
                className="text-xs text-loss font-body px-3 py-2 rounded-lg"
                style={{
                  background: "oklch(0.62 0.22 22 / 0.08)",
                  border: "1px solid oklch(0.62 0.22 22 / 0.2)",
                }}
              >
                Failed to save. Please try again.
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                data-ocid="profile.edit_save_button"
                type="submit"
                disabled={!isEditFormValid || saveProfile.isPending}
                className="flex-1 h-11 rounded-xl font-display font-semibold text-sm tracking-wide transition-all duration-200"
                style={{
                  background:
                    !isEditFormValid || saveProfile.isPending
                      ? "oklch(0.74 0.2 145 / 0.35)"
                      : "linear-gradient(135deg, oklch(0.74 0.2 145) 0%, oklch(0.65 0.18 145) 100%)",
                  color: "oklch(0.1 0.008 255)",
                  boxShadow:
                    !isEditFormValid || saveProfile.isPending
                      ? "none"
                      : "0 4px 16px oklch(0.74 0.2 145 / 0.3)",
                  border: "none",
                }}
              >
                {saveProfile.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                data-ocid="profile.cancel_button"
                type="button"
                variant="ghost"
                onClick={() => setEditSheetOpen(false)}
                className="h-11 px-4 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(var(--card))",
            color: "oklch(var(--foreground))",
            border: "1px solid oklch(var(--border))",
          },
        }}
      />
    </div>
  );
}
