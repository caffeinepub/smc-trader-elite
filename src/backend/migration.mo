import Map "mo:core/Map";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

module {
  type TradeId = Nat;
  type PlaybookEntryId = Nat;

  type TradeType = {
    #buy;
    #sell;
  };

  type TradeResult = {
    #win;
    #loss;
    #be;
  };

  type Session = {
    #asia;
    #london;
    #ny;
  };

  type Trade = {
    id : TradeId;
    owner : Principal;
    date : Text;
    pair : Text;
    tradeType : TradeType;
    entryPrice : Float;
    stopLoss : Float;
    takeProfit : Float;
    rrAchieved : Float;
    result : TradeResult;
    emotion : Text;
    notes : Text;
    screenshotFileId : ?Text;
  };

  type PlaybookEntry = {
    id : PlaybookEntryId;
    owner : Principal;
    pair : Text;
    session : Session;
    htfBias : Text;
    marketStructure : Text;
    liquidityTarget : Text;
    poi : Text;
    entryConfirmation : Text;
    rrTarget : Float;
    qualityScore : Nat;
    createdAt : Int;
  };

  type UserProfile = {
    displayName : Text;
    tradingStyle : Text;
    accountCurrency : Text;
    bio : Text;
    createdAt : Int;
  };

  type OldTrade = {
    id : TradeId;
    date : Text;
    pair : Text;
    tradeType : TradeType;
    entryPrice : Float;
    stopLoss : Float;
    takeProfit : Float;
    rrAchieved : Float;
    result : TradeResult;
    emotion : Text;
    notes : Text;
    screenshotFileId : ?Text;
  };

  type OldPlaybookEntry = {
    id : PlaybookEntryId;
    pair : Text;
    session : Session;
    htfBias : Text;
    marketStructure : Text;
    liquidityTarget : Text;
    poi : Text;
    entryConfirmation : Text;
    rrTarget : Float;
    qualityScore : Nat;
    createdAt : Int;
  };

  type OldActor = {
    trades : Map.Map<TradeId, OldTrade>;
    playbookEntries : Map.Map<PlaybookEntryId, OldPlaybookEntry>;
    nextTradeId : Nat;
    nextPlaybookEntryId : Nat;
  };

  type NewActor = {
    trades : Map.Map<TradeId, Trade>;
    playbookEntries : Map.Map<PlaybookEntryId, PlaybookEntry>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextTradeId : Nat;
    nextPlaybookEntryId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newTrades = old.trades.map<TradeId, OldTrade, Trade>(
      func(_id, oldTrade) {
        { oldTrade with owner = Principal.anonymous() };
      }
    );

    let newPlaybookEntries = old.playbookEntries.map<PlaybookEntryId, OldPlaybookEntry, PlaybookEntry>(
      func(_id, oldEntry) {
        { oldEntry with owner = Principal.anonymous() };
      }
    );

    {
      old with
      trades = newTrades;
      playbookEntries = newPlaybookEntries;
      userProfiles = Map.empty<Principal, UserProfile>();
    };
  };
};
