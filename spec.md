# SMC Trader Elite

## Current State

Full-stack trading journal with:
- Authentication via Internet Identity
- User profile setup
- Journal: log trades (pair, entry, SL, TP, RR, result, emotion, notes) with view/edit/delete
- Playbook: pre-trade checklist with view/edit/delete
- Dashboard: equity curve, performance stats
- Trade History: filterable trade list
- Risk Calculator: position sizing
- Performance analytics

Backend `Trade` model fields: id, owner, date, pair, tradeType, entryPrice, stopLoss, takeProfit, rrAchieved, result, emotion, notes, screenshotFileId

## Requested Changes (Diff)

### Add
- `entryTimeframe` (Text) field to the `Trade` backend model
- `tradeTime` (Text) field to the `Trade` backend model (time of trade entry, separate from date)
- A **TradingView Integration** panel in the Journal page — a dedicated URL-parameter-based auto-fill system:
  - The app reads URL query parameters (`?symbol=EURUSD&entry=1.08500&sl=1.08200&tp=1.09100&rr=2.5&timeframe=1H&time=14:30`) when the Journal page loads and auto-fills the corresponding form fields
  - Fields auto-filled from URL params (shown as "locked" with a TradingView badge): Instrument/Pair, Entry Price, Stop Loss, Take Profit, RR, Entry Timeframe, Trade Time
  - Fields that remain manually entered: Date, Trade Type, Result, Emotion, Notes
  - A "TradingView Setup Guide" section in Journal that explains how to configure TradingView alerts to send the webhook URL with the correct parameters, with copy-to-clipboard for the alert message template
  - A visual indicator on auto-filled fields showing they were populated from TradingView (green TV badge icon)
  - Auto-filled fields can still be edited by the user (they're pre-populated, not locked)
  - The Journal form should detect if URL params are present and show a "TradingView data loaded" banner at the top of the form
  - A dedicated "TV Extension" tab/button in the Journal that shows the integration setup guide

### Modify
- `createTrade` backend function: add `entryTimeframe` and `tradeTime` parameters
- `updateTrade` backend function: handle new fields
- Journal form: add `entryTimeframe` select (M1, M5, M15, M30, H1, H4, D1, W1) and `tradeTime` time input
- Journal view/edit sheet: show entryTimeframe and tradeTime fields
- Trade type shown in history and detail views should show entryTimeframe

### Remove
- Nothing removed

## Implementation Plan

1. Update `main.mo` backend: add `entryTimeframe: Text` and `tradeTime: Text` to Trade type; update createTrade and updateTrade function signatures
2. Regenerate `backend.d.ts` bindings (via generate_motoko_code)
3. Update Journal.tsx:
   - Add `entryTimeframe` and `tradeTime` to defaultForm and editForm state
   - Add timeframe select and time input to the form
   - Add URL parameter detection hook (reads on mount, auto-fills form, clears URL params)
   - Show "TradingView data loaded" success banner when URL params detected
   - Add TradingView badge on auto-filled fields
   - Add "Integration Guide" collapsible section with Pine Script alert message template and copyable webhook URL format
4. Update view/edit sheet in Journal to display new fields
5. Update TradeHistory cards to show timeframe badge
