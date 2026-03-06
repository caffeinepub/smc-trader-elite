import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Search,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { NavTab } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { type PublicTraderProfile, useNetwork } from "../hooks/useNetwork";
import { useProfile } from "../hooks/useQueries";

// ─── Trader Card ──────────────────────────────────────────────────────────────

const STYLE_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  SMC: {
    bg: "oklch(0.74 0.2 145 / 0.1)",
    text: "oklch(0.74 0.2 145)",
    border: "oklch(0.74 0.2 145 / 0.25)",
  },
  ICT: {
    bg: "oklch(0.65 0.18 220 / 0.1)",
    text: "oklch(0.65 0.18 220)",
    border: "oklch(0.65 0.18 220 / 0.25)",
  },
  "Price Action": {
    bg: "oklch(0.78 0.14 60 / 0.1)",
    text: "oklch(0.78 0.14 60)",
    border: "oklch(0.78 0.14 60 / 0.25)",
  },
  Hybrid: {
    bg: "oklch(0.62 0.2 295 / 0.1)",
    text: "oklch(0.62 0.2 295)",
    border: "oklch(0.62 0.2 295 / 0.25)",
  },
};

function styleColor(style: string) {
  return (
    STYLE_COLORS[style] ?? {
      bg: "oklch(var(--muted) / 0.3)",
      text: "oklch(var(--muted-foreground))",
      border: "oklch(var(--border) / 0.3)",
    }
  );
}

function avatarGradient(name: string) {
  const h = name.charCodeAt(0) % 360;
  return `linear-gradient(135deg, oklch(0.65 0.18 ${h} / 0.9) 0%, oklch(0.5 0.15 ${(h + 60) % 360} / 0.7) 100%)`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatJoinDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

function TraderCard({
  profile,
  isFollowing,
  onFollow,
  onUnfollow,
  onViewStrategies,
  showStrategies = false,
  index,
}: {
  profile: PublicTraderProfile;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  onViewStrategies?: () => void;
  showStrategies?: boolean;
  index: number;
}) {
  const colors = styleColor(profile.tradingStyle);
  const markerIdx = index + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.04, 0.2) }}
      data-ocid={markerIdx <= 3 ? `network.item.${markerIdx}` : undefined}
      className="glass-card rounded-2xl p-4 space-y-3 hover:border-win/20 transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-display font-bold shrink-0 text-white"
          style={{ background: avatarGradient(profile.displayName) }}
        >
          {initials(profile.displayName)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-display font-bold text-foreground text-sm truncate">
                {profile.displayName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="text-[10px] font-body px-2 py-0.5 rounded-full"
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {profile.tradingStyle}
                </span>
                <span className="text-[10px] text-muted-foreground font-body">
                  Since {formatJoinDate(profile.joinedAt)}
                </span>
              </div>
            </div>

            {/* Follow button */}
            <Button
              type="button"
              data-ocid="network.follow.button"
              size="sm"
              onClick={isFollowing ? onUnfollow : onFollow}
              className="h-8 px-3 rounded-xl text-xs font-body font-semibold transition-all shrink-0"
              style={
                isFollowing
                  ? {
                      background: "oklch(var(--muted) / 0.4)",
                      color: "oklch(var(--foreground) / 0.8)",
                      border: "1px solid oklch(var(--border) / 0.4)",
                    }
                  : {
                      background: "oklch(var(--win) / 0.12)",
                      color: "oklch(var(--win))",
                      border: "1px solid oklch(var(--win) / 0.3)",
                    }
              }
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  Follow
                </>
              )}
            </Button>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs text-muted-foreground font-body mt-2 line-clamp-2 leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* View strategies button */}
      {showStrategies && onViewStrategies && (
        <Button
          type="button"
          data-ocid="network.view_strategies.button"
          onClick={onViewStrategies}
          size="sm"
          variant="ghost"
          className="w-full h-8 rounded-xl text-xs font-body text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all border border-border/30 gap-2"
        >
          <BookOpen className="w-3.5 h-3.5" />
          View Strategies
        </Button>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface NetworkProps {
  onTabChange?: (tab: NavTab) => void;
}

export default function Network({ onTabChange }: NetworkProps) {
  const { identity } = useInternetIdentity();
  const { data: profile } = useProfile();
  const principalId = identity?.getPrincipal().toString() ?? "";

  const {
    discoverableProfiles,
    followedProfiles,
    follow,
    unfollow,
    isFollowing,
  } = useNetwork(principalId);

  const [search, setSearch] = useState("");

  const filteredDiscover = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return discoverableProfiles;
    return discoverableProfiles.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        p.tradingStyle.toLowerCase().includes(q),
    );
  }, [discoverableProfiles, search]);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay },
  });

  return (
    <section
      data-ocid="network.section"
      className="p-4 md:p-6 space-y-6 max-w-3xl animate-fade-in"
    >
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.18 220 / 0.8) 0%, oklch(0.5 0.15 260 / 0.6) 100%)",
            }}
          >
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
              Trader Network
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-body">
              Connect with fellow SMC traders and share strategies
            </p>
          </div>
        </div>
      </motion.div>

      {/* Notice */}
      <motion.div {...fadeUp(0.05)}>
        <div
          className="rounded-xl p-3 flex items-center gap-2.5"
          style={{
            background: "oklch(0.65 0.18 220 / 0.07)",
            border: "1px solid oklch(0.65 0.18 220 / 0.2)",
          }}
        >
          <Users
            className="w-4 h-4 shrink-0"
            style={{ color: "oklch(0.65 0.18 220)" }}
          />
          <p className="text-xs font-body text-muted-foreground">
            Connect with other SMC traders to see their strategies and refine
            your trading edge
          </p>
        </div>
      </motion.div>

      {/* Stats strip */}
      <motion.div {...fadeUp(0.08)} className="grid grid-cols-3 gap-3">
        {[
          { label: "Traders", value: discoverableProfiles.length.toString() },
          { label: "Following", value: followedProfiles.length.toString() },
          { label: "Style", value: profile?.tradingStyle ?? "—" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-3 text-center">
            <div className="text-lg font-mono font-bold text-foreground">
              {s.value}
            </div>
            <div className="text-[10px] text-muted-foreground font-body">
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeUp(0.1)}>
        <Tabs defaultValue="discover" className="w-full">
          <TabsList
            className="w-full grid grid-cols-2 rounded-xl h-10 mb-4"
            style={{
              background: "oklch(var(--muted) / 0.4)",
              border: "1px solid oklch(var(--border) / 0.4)",
            }}
          >
            <TabsTrigger
              value="discover"
              data-ocid="network.discover.tab"
              className="rounded-lg text-sm font-body font-medium data-[state=active]:bg-win data-[state=active]:text-background transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger
              value="following"
              data-ocid="network.following.tab"
              className="rounded-lg text-sm font-body font-medium data-[state=active]:bg-win data-[state=active]:text-background transition-all"
            >
              <UserCheck className="w-3.5 h-3.5 mr-2" />
              Following{" "}
              {followedProfiles.length > 0 && (
                <Badge
                  className="ml-1.5 text-[10px] px-1.5 py-0 h-4"
                  style={{
                    background: "oklch(var(--win) / 0.15)",
                    color: "oklch(var(--win))",
                    border: "1px solid oklch(var(--win) / 0.3)",
                  }}
                >
                  {followedProfiles.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Discover Tab ── */}
          <TabsContent value="discover" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="network.search.input"
                placeholder="Search by name or trading style…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-input/50 border-border/50 focus:border-win/50 font-body"
              />
            </div>

            <AnimatePresence mode="popLayout">
              {filteredDiscover.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  data-ocid="network.discover.empty_state"
                  className="glass-card rounded-2xl p-12 text-center"
                >
                  <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-body">
                    {search ? "No traders match your search" : "No traders yet"}
                  </p>
                  <p className="text-xs text-muted-foreground/60 font-body mt-1">
                    Invite other traders to join SMC Trader Elite
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDiscover.map((p, i) => (
                    <TraderCard
                      key={p.principalId}
                      profile={p}
                      index={i}
                      isFollowing={isFollowing(p.principalId)}
                      onFollow={() => follow(p.principalId)}
                      onUnfollow={() => unfollow(p.principalId)}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ── Following Tab ── */}
          <TabsContent value="following" className="space-y-4">
            <AnimatePresence mode="popLayout">
              {followedProfiles.length === 0 ? (
                <motion.div
                  key="following-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  data-ocid="network.following.empty_state"
                  className="glass-card rounded-2xl p-12 text-center space-y-3"
                >
                  <UserCheck className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                  <div>
                    <p className="text-sm text-muted-foreground font-body">
                      You're not following anyone yet
                    </p>
                    <p className="text-xs text-muted-foreground/60 font-body mt-1">
                      Discover traders and follow them to keep tabs on their
                      strategies
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {followedProfiles.map((p, i) => (
                    <TraderCard
                      key={p.principalId}
                      profile={p}
                      index={i}
                      isFollowing
                      showStrategies
                      onFollow={() => follow(p.principalId)}
                      onUnfollow={() => unfollow(p.principalId)}
                      onViewStrategies={() => {
                        if (onTabChange) onTabChange("strategies" as NavTab);
                      }}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {followedProfiles.length > 0 && (
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground font-body">
                  {followedProfiles.length} trader
                  {followedProfiles.length === 1 ? "" : "s"} followed
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Unfollow confirmation */}
      {followedProfiles.length > 0 && (
        <motion.div {...fadeUp(0.2)}>
          <div
            className="rounded-xl p-3 flex items-center gap-3"
            style={{
              background: "oklch(var(--muted) / 0.2)",
              border: "1px solid oklch(var(--border) / 0.3)",
            }}
          >
            <UserMinus className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            <p className="text-xs text-muted-foreground/60 font-body">
              Click "Following" on any trader card to unfollow them
            </p>
          </div>
        </motion.div>
      )}
    </section>
  );
}
