import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type TradeTime = string;
export type TradeId = bigint;
export interface Trade {
    id: TradeId;
    result: TradeResult;
    screenshotFileId?: string;
    tradeTime: TradeTime;
    tradeType: TradeType;
    emotion: string;
    owner: Principal;
    date: string;
    takeProfit: number;
    pair: string;
    rrAchieved: number;
    stopLoss: number;
    notes: string;
    entryTimeframe: Timeframe;
    entryPrice: number;
}
export interface PlaybookEntry {
    id: PlaybookEntryId;
    poi: string;
    htfBias: string;
    owner: Principal;
    createdAt: bigint;
    pair: string;
    liquidityTarget: string;
    qualityScore: bigint;
    session: Session;
    marketStructure: string;
    rrTarget: number;
    entryConfirmation: string;
}
export type Timeframe = string;
export interface UserProfile {
    bio: string;
    tradingStyle: string;
    displayName: string;
    createdAt: bigint;
    accountCurrency: string;
}
export type PlaybookEntryId = bigint;
export enum Session {
    ny = "ny",
    asia = "asia",
    london = "london"
}
export enum TradeResult {
    be = "be",
    win = "win",
    loss = "loss"
}
export enum TradeType {
    buy = "buy",
    sell = "sell"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateAverageRR(): Promise<number>;
    calculateLongestLossStreak(): Promise<bigint>;
    calculateLongestWinStreak(): Promise<bigint>;
    calculateWinRate(): Promise<number>;
    countTradeResults(): Promise<[bigint, bigint, bigint]>;
    createPlaybookEntry(pair: string, session: Session, htfBias: string, marketStructure: string, liquidityTarget: string, poi: string, entryConfirmation: string, rrTarget: number, qualityScore: bigint): Promise<PlaybookEntryId>;
    createTrade(date: string, pair: string, tradeType: TradeType, entryPrice: number, stopLoss: number, takeProfit: number, rrAchieved: number, result: TradeResult, emotion: string, notes: string, screenshotFileId: string | null, entryTimeframe: Timeframe, tradeTime: TradeTime): Promise<TradeId>;
    deletePlaybookEntry(id: PlaybookEntryId): Promise<void>;
    deleteTrade(id: TradeId): Promise<void>;
    getAllPlaybookEntries(): Promise<Array<PlaybookEntry>>;
    getAllTrades(): Promise<Array<Trade>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLosingPairs(): Promise<Array<string>>;
    getPlaybookEntry(id: PlaybookEntryId): Promise<PlaybookEntry>;
    getProfile(): Promise<UserProfile | null>;
    getTrade(id: TradeId): Promise<Trade>;
    getTradesByPair(pair: string): Promise<Array<Trade>>;
    getTradesByResult(result: TradeResult): Promise<Array<Trade>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWinRateByPair(pair: string): Promise<number>;
    getWinRateByTradeType(tradeType: TradeType): Promise<number>;
    getWinningPairs(): Promise<Array<string>>;
    hasProfile(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveProfile(displayName: string, tradingStyle: string, accountCurrency: string, bio: string): Promise<void>;
    updatePlaybookEntry(entry: PlaybookEntry): Promise<void>;
    updateTrade(trade: Trade): Promise<void>;
}
