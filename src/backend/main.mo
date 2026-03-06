import MixinStorage "blob-storage/Mixin";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
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

  type Timeframe = Text; // E.g. "M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"
  type TradeTime = Text; // Time of trade entry as Text, e.g. "14:30"

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
    entryTimeframe : Timeframe; // New field for entry timeframe
    tradeTime : TradeTime; // New field for trade entry time
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

  module Trade {
    public func compare(a : Trade, b : Trade) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module PlaybookEntry {
    public func compare(a : PlaybookEntry, b : PlaybookEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let trades = Map.empty<TradeId, Trade>();
  let playbookEntries = Map.empty<PlaybookEntryId, PlaybookEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextTradeId = 1;
  var nextPlaybookEntryId = 1;

  include MixinStorage();

  //////////////////////////////////
  // Trade Operations
  //////////////////////////////////

  public shared ({ caller }) func createTrade(
    date : Text,
    pair : Text,
    tradeType : TradeType,
    entryPrice : Float,
    stopLoss : Float,
    takeProfit : Float,
    rrAchieved : Float,
    result : TradeResult,
    emotion : Text,
    notes : Text,
    screenshotFileId : ?Text,
    entryTimeframe : Timeframe,
    tradeTime : TradeTime,
  ) : async TradeId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create trades");
    };

    let id = nextTradeId;
    let trade : Trade = {
      id;
      owner = caller;
      date;
      pair;
      tradeType;
      entryPrice;
      stopLoss;
      takeProfit;
      rrAchieved;
      result;
      emotion;
      notes;
      screenshotFileId;
      entryTimeframe;
      tradeTime;
    };
    trades.add(id, trade);
    nextTradeId += 1;
    id;
  };

  public query ({ caller }) func getTrade(id : TradeId) : async Trade {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trades");
    };

    switch (trades.get(id)) {
      case (null) { Runtime.trap("Trade not found") };
      case (?trade) {
        if (trade.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own trades");
        };
        trade;
      };
    };
  };

  public query ({ caller }) func getAllTrades() : async [Trade] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trades");
    };

    trades.values().toArray().filter(func(t) { 
      t.owner == caller or AccessControl.isAdmin(accessControlState, caller)
    }).sort();
  };

  public shared ({ caller }) func updateTrade(trade : Trade) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update trades");
    };

    if (not trades.containsKey(trade.id)) {
      Runtime.trap("Trade not found");
    };

    switch (trades.get(trade.id)) {
      case (null) { Runtime.trap("Trade not found") };
      case (?existingTrade) {
        if (existingTrade.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own trades");
        };
        let updatedTrade = { trade with owner = existingTrade.owner };
        trades.add(trade.id, updatedTrade);
      };
    };
  };

  public shared ({ caller }) func deleteTrade(id : TradeId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete trades");
    };

    switch (trades.get(id)) {
      case (null) { Runtime.trap("Trade not found") };
      case (?trade) {
        if (trade.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own trades");
        };
        trades.remove(id);
      };
    };
  };

  public query ({ caller }) func getTradesByResult(result : TradeResult) : async [Trade] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trades");
    };

    trades.values().toArray().filter(func(t) { 
      t.result == result and (t.owner == caller or AccessControl.isAdmin(accessControlState, caller))
    }).sort();
  };

  public query ({ caller }) func getTradesByPair(pair : Text) : async [Trade] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trades");
    };

    trades.values().toArray().filter(func(t) { 
      t.pair == pair and (t.owner == caller or AccessControl.isAdmin(accessControlState, caller))
    }).sort();
  };

  // Trade Type Extensions

  public query ({ caller }) func countTradeResults() : async (Nat, Nat, Nat) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };

    var wins = 0;
    var losses = 0;
    var be = 0;

    for (trade in trades.values()) {
      if (trade.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
        switch (trade.result) {
          case (#win) { wins += 1 };
          case (#loss) { losses += 1 };
          case (#be) { be += 1 };
        };
      };
    };

    (wins, losses, be);
  };

  public query ({ caller }) func calculateWinRate() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };

    var wins = 0;
    var losses = 0;
    var be = 0;

    for (trade in trades.values()) {
      if (trade.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
        switch (trade.result) {
          case (#win) { wins += 1 };
          case (#loss) { losses += 1 };
          case (#be) { be += 1 };
        };
      };
    };

    let total = wins + losses + be;

    if (total == 0) {
      return 0.0;
    };
    wins.toFloat() / total.toFloat() * 100.0;
  };

  public query ({ caller }) func calculateAverageRR() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };

    var totalRR = 0.0;
    var count = 0;
    for (trade in trades.values()) {
      if (trade.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
        totalRR += trade.rrAchieved;
        count += 1;
      };
    };
    if (count == 0) {
      return 0.0;
    };
    totalRR / count.toFloat();
  };

  public query ({ caller }) func calculateLongestWinStreak() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };

    var currentStreak = 0;
    var longestStreak = 0;

    for (trade in trades.values()) {
      if (trade.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
        switch (trade.result) {
          case (#win) {
            currentStreak += 1;
            if (currentStreak > longestStreak) {
              longestStreak := currentStreak;
            };
          };
          case (_) {
            currentStreak := 0;
          };
        };
      };
    };

    longestStreak;
  };

  public query ({ caller }) func calculateLongestLossStreak() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };

    var currentStreak = 0;
    var longestStreak = 0;

    for (trade in trades.values()) {
      if (trade.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
        switch (trade.result) {
          case (#loss) {
            currentStreak += 1;
            if (currentStreak > longestStreak) {
              longestStreak := currentStreak;
            };
          };
          case (_) {
            currentStreak := 0;
          };
        };
      };
    };

    longestStreak;
  };

  // Winning Pairs
  public query ({ caller }) func getWinningPairs() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };

    let pairs = Set.empty<Text>();

    for (trade in trades.values()) {
      if (trade.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
        switch (trade.result) {
          case (#win) {
            pairs.add(trade.pair);
          };
          case (_) { () };
        };
      };
    };

    pairs.toArray();
  };

  // Losing Pairs
  public query ({ caller }) func getLosingPairs() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };

    let pairs = Set.empty<Text>();

    for (trade in trades.values()) {
      if (trade.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
        switch (trade.result) {
          case (#loss) {
            pairs.add(trade.pair);
          };
          case (_) { () };
        };
      };
    };

    pairs.toArray();
  };

  // Win Rate By Pair
  public query ({ caller }) func getWinRateByPair(pair : Text) : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };

    var total = 0;
    var wins = 0;

    for (trade in trades.values()) {
      if ((trade.owner == caller or AccessControl.isAdmin(accessControlState, caller)) and trade.pair == pair) {
        total += 1;
        switch (trade.result) {
          case (#win) { wins += 1 };
          case (_) { () };
        };
      };
    };

    if (total == 0) {
      return 0.0;
    };

    wins.toFloat() / total.toFloat() * 100.0;
  };

  // Win Rate By Trade Type
  public query ({ caller }) func getWinRateByTradeType(tradeType : TradeType) : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };

    var total = 0;
    var wins = 0;

    for (trade in trades.values()) {
      if ((trade.owner == caller or AccessControl.isAdmin(accessControlState, caller)) and trade.tradeType == tradeType) {
        total += 1;
        switch (trade.result) {
          case (#win) { wins += 1 };
          case (_) { () };
        };
      };
    };

    if (total == 0) {
      return 0.0;
    };

    wins.toFloat() / total.toFloat() * 100.0;
  };

  //////////////////////////////////
  // Playbook Entry Operations
  //////////////////////////////////

  public shared ({ caller }) func createPlaybookEntry(
    pair : Text,
    session : Session,
    htfBias : Text,
    marketStructure : Text,
    liquidityTarget : Text,
    poi : Text,
    entryConfirmation : Text,
    rrTarget : Float,
    qualityScore : Nat,
  ) : async PlaybookEntryId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create playbook entries");
    };

    let id = nextPlaybookEntryId;
    let entry : PlaybookEntry = {
      id;
      owner = caller;
      pair;
      session;
      htfBias;
      marketStructure;
      liquidityTarget;
      poi;
      entryConfirmation;
      rrTarget;
      qualityScore;
      createdAt = Time.now();
    };
    playbookEntries.add(id, entry);
    nextPlaybookEntryId += 1;
    id;
  };

  public query ({ caller }) func getPlaybookEntry(id : PlaybookEntryId) : async PlaybookEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view playbook entries");
    };

    switch (playbookEntries.get(id)) {
      case (null) { Runtime.trap("Playbook entry not found") };
      case (?entry) {
        if (entry.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own playbook entries");
        };
        entry;
      };
    };
  };

  public query ({ caller }) func getAllPlaybookEntries() : async [PlaybookEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view playbook entries");
    };

    playbookEntries.values().toArray().filter(func(e) { 
      e.owner == caller or AccessControl.isAdmin(accessControlState, caller)
    }).sort();
  };

  public shared ({ caller }) func updatePlaybookEntry(entry : PlaybookEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update playbook entries");
    };

    if (not playbookEntries.containsKey(entry.id)) {
      Runtime.trap("Playbook entry not found");
    };

    switch (playbookEntries.get(entry.id)) {
      case (null) { Runtime.trap("Playbook entry not found") };
      case (?existingEntry) {
        if (existingEntry.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own playbook entries");
        };
        let updatedEntry = { entry with owner = existingEntry.owner };
        playbookEntries.add(entry.id, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func deletePlaybookEntry(id : PlaybookEntryId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete playbook entries");
    };

    switch (playbookEntries.get(id)) {
      case (null) { Runtime.trap("Playbook entry not found") };
      case (?entry) {
        if (entry.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own playbook entries");
        };
        playbookEntries.remove(id);
      };
    };
  };

  //////////////////////////////////
  // User Profile Operations
  //////////////////////////////////

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveProfile(displayName : Text, tradingStyle : Text, accountCurrency : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let profile : UserProfile = {
      displayName;
      tradingStyle;
      accountCurrency;
      bio;
      createdAt = Time.now();
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func hasProfile() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check profile status");
    };
    userProfiles.containsKey(caller);
  };
};

