# SMC Trader Elite

## Current State

The app is a full-stack trading journal with:
- Authentication via Internet Identity
- User profile setup (display name, trading style, currency, bio)
- Dashboard with equity curve and stats cards
- Playbook: pre-trade checklist (fixed fields: pair, session, HTF bias, market structure, liquidity target, POI, entry confirmation, RR target, quality score)
- Journal: trade entry form (date, pair, type, entry/SL/TP, RR, result, emotion, notes, screenshot)
- Trade History: filterable trade list with detail/edit sheets
- Risk Calculator: instrument selector, entry/SL inputs, position size and TP outputs
- Performance: analytics charts, equity curve, win rate, avg RR, profit factor
- Navigation: bottom tab (mobile) + sidebar (desktop)

Backend entities: `Trade`, `PlaybookEntry`, `UserProfile`

## Requested Changes (Diff)

### Add

1. **Settings Panel** (new nav tab + page)
   - Theme selector: Dark, Light, System, Mixed/Hybrid
   - Primary color picker (accent color, 8 preset OKLCH swatches + custom)
   - Secondary color picker
   - Font selector: SF Pro style, Inter, Mono, Serif (4 options)
   - Animation toggle: Full / Reduced / None
   - Settings persisted in localStorage (no backend needed)
   - Apply theme/color changes to CSS custom properties in real-time

2. **Strategy Sharing** (new nav tab + page)
   - Users can publish a "Proven Strategy" card when they have >= 3 months of trades and a profitable track record
   - Strategy card fields: strategy name, entry model description, market context, timeframes used, overall trade summary (total trades, wins, losses, win rate auto-calculated from their journal), shareable link/code
   - Strategy is stored in backend as a new `Strategy` type
   - All users can browse published strategies from others (public read)
   - Strategy cards show: author display name, win rate badge, total trades, profit factor, RR avg, entry model summary, market context, "Follow" button
   - Min 3 months threshold enforced on frontend (check earliest trade date)

3. **Custom Playbook Builder** (extend existing Playbook page with a "Create Custom" tab)
   - Users can create fully custom playbook templates with their own fields
   - Sections they can add/configure: Asset & Session, Market Context, Entry Model, Targets & Quality
   - Each section can have custom field labels and free-text/select input types
   - Custom playbook templates stored in backend as `CustomPlaybook` type
   - Saved templates appear alongside standard playbook entries
   - Users can use a saved custom template to fill in and log a playbook entry

4. **Trader Network** (new nav tab + page)
   - Follow/unfollow other traders by their Principal ID or username
   - Following feed: see recently shared playbook entries and strategies from followed traders
   - User profile cards with: display name, trading style, win rate, total trades, follow button
   - "Discover" tab: browse all users who have a public profile
   - "Following" tab: feed from followed users
   - Backend: `Follow` relationship type, query for followers/following, public profile listing

### Modify

- Navigation: add "Settings", "Strategies", "Network" tabs (total 9 tabs — reorganize sidebar/bottom nav for overflow, use icon-only labels on mobile or a "More" overflow menu)
- `getUserProfile` on backend: remove admin-only restriction so any authenticated user can view any public profile
- Existing Playbook page: add "Custom" tab alongside standard playbook list

### Remove

- Nothing removed

## Implementation Plan

### Backend (Motoko)

1. Add `Strategy` type: id, owner, name, entryModelDescription, marketContext, timeframes, isPublic, createdAt; CRUD + `getPublicStrategies()` + `getAllStrategies()` for owner
2. Add `CustomPlaybook` type: id, owner, name, sections (array of {sectionType, fieldLabel, fieldType, value}), createdAt; CRUD for owner
3. Add `Follow` type: follower Principal, followee Principal; `followUser`, `unfollowUser`, `getFollowers`, `getFollowing`, `isFollowing`
4. Add `getPublicProfiles()` — returns all profiles with their Principal so network discover works
5. Relax `getUserProfile` to allow any authenticated user to read any profile

### Frontend

1. **SettingsContext**: React context providing theme, primaryColor, secondaryColor, font, animationLevel — apply to `document.documentElement` CSS vars; persist to localStorage
2. **Settings page**: UI for all appearance settings with live preview
3. **Strategies page**: list of public strategies from all users + form to publish own strategy (gated by 3-month profitable check)
4. **Custom Playbook tab** on Playbook page: template builder UI with draggable/addable sections
5. **Network page**: Discover tab (all public profiles + follow button), Following tab (feed of followed users' playbook entries and strategies)
6. **Nav update**: add Settings (gear icon), Strategies (star icon), Network (users icon) to sidebar and bottom nav
