import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublicTraderProfile {
  principalId: string;
  displayName: string;
  tradingStyle: string;
  bio: string;
  joinedAt: number;
}

interface FollowData {
  myPrincipal: string;
  following: string[];
}

const PROFILES_KEY = "smc-trader-profiles";
const FOLLOWING_KEY = "smc-network-following";

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadProfiles(): PublicTraderProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw) as PublicTraderProfile[];
  } catch {}
  return [];
}

function saveProfiles(profiles: PublicTraderProfile[]) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {}
}

function loadFollowData(myPrincipal: string): FollowData {
  try {
    const raw = localStorage.getItem(FOLLOWING_KEY);
    if (raw) {
      const allData = JSON.parse(raw) as FollowData[];
      const mine = allData.find((d) => d.myPrincipal === myPrincipal);
      if (mine) return mine;
    }
  } catch {}
  return { myPrincipal, following: [] };
}

function saveFollowData(data: FollowData) {
  try {
    const raw = localStorage.getItem(FOLLOWING_KEY);
    let allData: FollowData[] = [];
    if (raw) allData = JSON.parse(raw) as FollowData[];
    const idx = allData.findIndex((d) => d.myPrincipal === data.myPrincipal);
    if (idx >= 0) allData[idx] = data;
    else allData.push(data);
    localStorage.setItem(FOLLOWING_KEY, JSON.stringify(allData));
  } catch {}
}

// Seed some demo profiles so Discover isn't empty
function seedDemoProfiles() {
  const existing = loadProfiles();
  const hasDemos = existing.some((p) =>
    p.principalId.startsWith("demo-principal"),
  );
  if (hasDemos) return;

  const demos: PublicTraderProfile[] = [
    {
      principalId: "demo-principal-1",
      displayName: "Alex Rivers",
      tradingStyle: "SMC",
      bio: "Full-time SMC trader since 2020. Specialise in London session OB entries on major pairs and Gold.",
      joinedAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
    },
    {
      principalId: "demo-principal-2",
      displayName: "Mia Chen",
      tradingStyle: "ICT",
      bio: "ICT concepts trader focusing on NY Open FVG scalps. Crypto and Forex. Consistent since 2021.",
      joinedAt: Date.now() - 200 * 24 * 60 * 60 * 1000,
    },
    {
      principalId: "demo-principal-3",
      displayName: "Tariq Hassan",
      tradingStyle: "Hybrid",
      bio: "Swing trader on XAUUSD and US indices. HTF OTE entries with SMC/ICT blend. Patient approach.",
      joinedAt: Date.now() - 300 * 24 * 60 * 60 * 1000,
    },
    {
      principalId: "demo-principal-4",
      displayName: "Priya Sharma",
      tradingStyle: "Price Action",
      bio: "Price action purist. No indicators, just structure, candles, and key levels. Forex and commodities.",
      joinedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    },
  ];

  const next = [...existing, ...demos];
  saveProfiles(next);
}

// ─── Register current user's profile ─────────────────────────────────────────

export function registerPublicProfile(profile: {
  principalId: string;
  displayName: string;
  tradingStyle: string;
  bio: string;
}) {
  const existing = loadProfiles();
  const idx = existing.findIndex((p) => p.principalId === profile.principalId);
  const entry: PublicTraderProfile = {
    ...profile,
    joinedAt: idx >= 0 ? existing[idx].joinedAt : Date.now(),
  };
  if (idx >= 0) existing[idx] = entry;
  else existing.push(entry);
  saveProfiles(existing);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNetwork(myPrincipalId?: string) {
  const [profiles, setProfiles] = useState<PublicTraderProfile[]>(() => {
    seedDemoProfiles();
    return loadProfiles();
  });

  const [followData, setFollowData] = useState<FollowData>(() =>
    loadFollowData(myPrincipalId ?? ""),
  );

  useEffect(() => {
    if (!myPrincipalId) return;
    setFollowData(loadFollowData(myPrincipalId));
  }, [myPrincipalId]);

  const refresh = useCallback(() => {
    setProfiles(loadProfiles());
    if (myPrincipalId) setFollowData(loadFollowData(myPrincipalId));
  }, [myPrincipalId]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const discoverableProfiles = profiles.filter(
    (p) => p.principalId !== myPrincipalId,
  );

  const followingIds = followData.following;

  const follow = useCallback(
    (principalId: string) => {
      if (!myPrincipalId) return;
      const next = {
        ...followData,
        following: [...new Set([...followData.following, principalId])],
      };
      saveFollowData(next);
      setFollowData(next);
    },
    [followData, myPrincipalId],
  );

  const unfollow = useCallback(
    (principalId: string) => {
      if (!myPrincipalId) return;
      const next = {
        ...followData,
        following: followData.following.filter((id) => id !== principalId),
      };
      saveFollowData(next);
      setFollowData(next);
    },
    [followData, myPrincipalId],
  );

  const isFollowing = useCallback(
    (principalId: string) => followingIds.includes(principalId),
    [followingIds],
  );

  const followedProfiles = profiles.filter((p) =>
    followingIds.includes(p.principalId),
  );

  return {
    discoverableProfiles,
    followingIds,
    followedProfiles,
    follow,
    unfollow,
    isFollowing,
    refresh,
  };
}
