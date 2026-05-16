# Bourbon Drop Tracker — Conventions & Rules

## File Naming
- HTML files: `bourbon-drop-tracker-YYYYMMDD-HHMM.html`
- Example: `bourbon-drop-tracker-20260514-1200.html`
- GitHub repo file is always named `index.html`
- At end of every chat session, Claude generates updated project files

## Wave Naming Convention (NEW — going forward)
Format: `YYYY.MM.DD-DXX-bottles`
- Date = first confirmed drop date IN THAT DISTRICT (not your store, not regional)
- District prefix = each district gets its own wave entry
- Examples: `2026.05.13-D14-Stagg-HH22`, `2026.05.13-D17-BT`
- Old wave labels (date + bottles only) stay as-is — do not rename historical data

## Drop ID Format
`SRC-YYYYMMDD-HHMMSS-STOREID-SEQ`
- SRC: APP (logged via app), DIS (Discord import), MAN (manual sheet entry), REV (review queue)
- Example: `APP-20260513-143022-267-001`
- Backfilled historical drops use MAN prefix

## District Colors
- D14: #f59e0b (amber) — home district, highest priority
- D17: #2563eb (cobalt blue)
- D18: #10b981 (emerald green)
- D07: #ef4444 (red)
- D20: #06b6d4 (teal)
- D16: #64748b (slate)
- D12: #475569 (dark slate)

## District Z-Index (pin layering — D14 on top)
D14:700, D17:600, D18:500, D07:400, D20:300, D16:200, D12:100

## Store 267
User's closest store — McLean, VA (1445B Chain Bridge Road)
Coordinates: 38.931395642689104, -77.1789699238521
Used as home reference for distance calculations when distMode = 'home'

## Auth Token
SCRIPT_TOKEN = 'bourbon2026'
Must match TOKEN in Apps Script. All write actions require token in URL.

## Apps Script
URL: https://script.google.com/macros/s/AKfycbzFjkKeNmvRXkxe2nj0I58wrwcgRLud97job4_2c3DQaHRf3lvGHRY5hvx-W429F6pg/exec
Sheet ID: 1BPPZsFvoeNWiH5rC8x3PSsKUOEq7GhPhD5qgEC5DWy4
- All writes use GET requests (not POST) to avoid CORS issues
- Data passed as `?action=X&data=ENCODED&token=bourbon2026`
- ALWAYS redeploy as New Version after any script changes

## Coding Rules — CRITICAL
1. NEVER use `const` to override/wrap existing functions — causes hoisting errors
2. Rename original to `_functionNameCore` before defining enhanced version
3. Always call `initAndDetect()` as the VERY LAST line of the script
4. Desktop layout uses `body.desktop` CSS class — mobile is default
5. Two map instances: `map` (mobile) and `desktopMap` (desktop) — always update both
6. Call `invalidateDropCache()` after ANY change to DROPS or pendingDrops
7. All sheet writes go through `scriptPost(action, payload)` helper
8. Cache version is `CACHE_VERSION = '4'` — bump when schema changes

## Google Sheets Column Names (Drops tab)
wave, storeId, district, result, timestamp, reporter, bottles, notes, discordLink,
dropQuality, topBottle, minutesSinceMidnight, dayOfWeek, hellcatNotes, truckNotes,
needsReview, dropId

## Bottle Shortcode Conventions
- ER = Eagle Rare 10yr (NOT 17yr)
- RR = Russell's Reserve SiB (NOT Rabbit Hole)
- EHT = EH Taylor Small Batch (default)
- OF1924 = AMBIGUOUS — could be OFitz1924 (HH) or OFo1924 (BF)
- MTBF = Michter's Toasted (NOT Penelope)
- PTB/PenToast = Penelope Toasted

## End of Session Checklist
1. Push index.html to GitHub (hard refresh to confirm version badge)
2. Update project files: index.html, Code.gs, TODO.md, FEATURES.md, DATAMODEL.md, CONVENTIONS.md, CHANGELOG.md
3. Note any unresolved bugs or decisions in TODO.md
