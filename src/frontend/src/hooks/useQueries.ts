import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, TradeResult, TradeType } from "../backend.d";
import { useActor } from "./useActor";

// ─── Profile Queries ──────────────────────────────────────────────────────────

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      displayName: string;
      tradingStyle: string;
      accountCurrency: string;
      bio: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveProfile(
        params.displayName,
        params.tradingStyle,
        params.accountCurrency,
        params.bio,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ─── Trade Queries ────────────────────────────────────────────────────────────

export function useAllTrades() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["trades"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTrades();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCountTradeResults() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["countTradeResults"],
    queryFn: async () => {
      if (!actor) return [0n, 0n, 0n] as [bigint, bigint, bigint];
      return actor.countTradeResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWinRate() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["winRate"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.calculateWinRate();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAverageRR() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["averageRR"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.calculateAverageRR();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLongestWinStreak() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["longestWinStreak"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.calculateLongestWinStreak();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLongestLossStreak() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["longestLossStreak"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.calculateLongestLossStreak();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWinningPairs() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["winningPairs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWinningPairs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLosingPairs() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["losingPairs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLosingPairs();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Trade Mutations ──────────────────────────────────────────────────────────

export function useCreateTrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      date: string;
      pair: string;
      tradeType: TradeType;
      entryPrice: number;
      stopLoss: number;
      takeProfit: number;
      rrAchieved: number;
      result: TradeResult;
      emotion: string;
      notes: string;
      screenshotFileId: string | null;
      entryTimeframe: string;
      tradeTime: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTrade(
        params.date,
        params.pair,
        params.tradeType,
        params.entryPrice,
        params.stopLoss,
        params.takeProfit,
        params.rrAchieved,
        params.result,
        params.emotion,
        params.notes,
        params.screenshotFileId,
        params.entryTimeframe,
        params.tradeTime,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["trades"] });
      void queryClient.invalidateQueries({ queryKey: ["winRate"] });
      void queryClient.invalidateQueries({ queryKey: ["averageRR"] });
      void queryClient.invalidateQueries({ queryKey: ["countTradeResults"] });
      void queryClient.invalidateQueries({ queryKey: ["longestWinStreak"] });
      void queryClient.invalidateQueries({ queryKey: ["longestLossStreak"] });
      void queryClient.invalidateQueries({ queryKey: ["winningPairs"] });
      void queryClient.invalidateQueries({ queryKey: ["losingPairs"] });
    },
  });
}

export function useDeleteTrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTrade(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["trades"] });
      void queryClient.invalidateQueries({ queryKey: ["winRate"] });
      void queryClient.invalidateQueries({ queryKey: ["averageRR"] });
      void queryClient.invalidateQueries({ queryKey: ["countTradeResults"] });
      void queryClient.invalidateQueries({ queryKey: ["longestWinStreak"] });
      void queryClient.invalidateQueries({ queryKey: ["longestLossStreak"] });
      void queryClient.invalidateQueries({ queryKey: ["winningPairs"] });
      void queryClient.invalidateQueries({ queryKey: ["losingPairs"] });
    },
  });
}

// ─── Playbook Queries ─────────────────────────────────────────────────────────

export function useAllPlaybookEntries() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["playbookEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPlaybookEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePlaybookEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      pair: string;
      session: Session;
      htfBias: string;
      marketStructure: string;
      liquidityTarget: string;
      poi: string;
      entryConfirmation: string;
      rrTarget: number;
      qualityScore: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createPlaybookEntry(
        params.pair,
        params.session,
        params.htfBias,
        params.marketStructure,
        params.liquidityTarget,
        params.poi,
        params.entryConfirmation,
        params.rrTarget,
        params.qualityScore,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["playbookEntries"] });
    },
  });
}

export function useDeletePlaybookEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deletePlaybookEntry(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["playbookEntries"] });
    },
  });
}

// ─── Update Mutations ─────────────────────────────────────────────────────────

export function useUpdateTrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trade: import("../backend.d").Trade) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTrade(trade);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["trades"] });
      void queryClient.invalidateQueries({ queryKey: ["winRate"] });
      void queryClient.invalidateQueries({ queryKey: ["averageRR"] });
      void queryClient.invalidateQueries({ queryKey: ["countTradeResults"] });
      void queryClient.invalidateQueries({ queryKey: ["longestWinStreak"] });
      void queryClient.invalidateQueries({ queryKey: ["longestLossStreak"] });
      void queryClient.invalidateQueries({ queryKey: ["winningPairs"] });
      void queryClient.invalidateQueries({ queryKey: ["losingPairs"] });
    },
  });
}

export function useUpdatePlaybookEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: import("../backend.d").PlaybookEntry) => {
      if (!actor) throw new Error("Not connected");
      return actor.updatePlaybookEntry(entry);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["playbookEntries"] });
    },
  });
}
