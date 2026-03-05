# SMC Trader Elite

## Current State
- Full trading journal app with 6 screens: Dashboard, Playbook, Journal, Trade History, Risk Calculator, Performance.
- Authentication via Internet Identity (useInternetIdentity hook).
- Backend stores trades and playbook entries but has no user profile data.
- After login, user is taken directly to the Dashboard with no profile information shown.

## Requested Changes (Diff)

### Add
- `UserProfile` type in backend: `{ displayName: Text; tradingStyle: Text; accountCurrency: Text; createdAt: Int }`.
- `getProfile` query and `saveProfile` update in backend, keyed per caller principal.
- `ProfileSetup` page/screen in frontend shown after first login when no profile exists.
- Profile fields: Display Name (required), Trading Style (dropdown: SMC / ICT / Price Action / Hybrid), Account Currency (dropdown: USD / EUR / GBP / JPY), optional bio/note.
- Once profile is saved, redirect to Dashboard.
- Profile accessible from a "Profile" option in the header or sidebar (edit profile later).
- Display the user's display name in the app header once set.

### Modify
- `App.tsx`: after authentication check, also check if profile exists. If no profile, show `ProfileSetup` screen instead of main app.
- Header: show user's display name instead of static text when available.
- Desktop sidebar and mobile bottom nav: add a profile avatar/name indicator.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `UserProfile` type and principal-keyed profile map to `main.mo`.
2. Add `saveProfile(displayName, tradingStyle, accountCurrency, bio)` and `getProfile()` functions to backend.
3. Regenerate `backend.d.ts` via `generate_motoko_code`.
4. Create `ProfileSetup.tsx` page — a full-screen onboarding form with display name, trading style, account currency, and bio fields. Save triggers `saveProfile`, then transitions to Dashboard.
5. Update `App.tsx` to query profile on mount; if no profile exists, render `ProfileSetup` instead of main layout.
6. Update header to show `profile.displayName` when available.
7. Add an "Edit Profile" entry in the desktop sidebar and a small avatar/name chip in the header.
