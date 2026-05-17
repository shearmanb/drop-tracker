# Bourbon Drop Tracker — Feature Backlog

## 🔧 Bugs / Data Issues

**B1 — OF1924 Collision Flag**
Two entries use OF1924 for different bottles — Old Fitzgerald 1924 (Heaven Hill) vs Old Forester 1924 10yr (Brown-Forman). Flag these in the Drops sheet for review during idle mode.

---

## ✨ Features

### In Progress / Next Sprint

**F11 — BottleDrops persistence** *(picker UI complete — sheet backend pending)*
Create Bottles + BottleDrops tabs in Google Sheet. Add `getBottles` and `addBottleDrop` Apps Script actions. Wire picker's confirmed/absent/rumored status through to sheet. Idle-time bottle filling with wave-keyword pre-suggestion.

---

### Map & Navigation

**F15 — Cycle Coverage Alerts**
"D14 is 80% done — 3 stores haven't dropped yet" style ambient alerts on the map or sidebar.

**Due for a Drop Alert**
Stores that historically drop but haven't yet this cycle — highlight specially, especially S-tier stores.

**Hunt Mode Improvements**
- Auto-refresh hunt list when new drops come in
- "I'm heading there" button that starts navigation AND marks store as in-progress
- Estimated time before store likely sells out based on tier + time since drop

---

### Data Entry & Logging

**F11 — Bottle Master List + Picker**
Full bottle normalization — 69 bottles identified from VABC allocated list. Brand/shortcode/tier structure. Confirmed/absent/rumored status per drop. Picker UI in entry panel. Idle-time bottle filling. New Google Sheet tab: Bottles.

Key bottle corrections already researched:
- ER = Eagle Rare 10yr (NOT 17yr)
- RR = Russell's Reserve (NOT Rabbit Hole)
- ETL = Elmer T. Lee (Buffalo Trace product)
- MTBF = Michter's Toasted Barrel Finish (not Penelope)
- Penelope Toasted = PTB or PenToast
- OF1924 = FLAGGED collision (see B1)
- Pomega = Penelope Omega
- Rio = Penelope Rio
- Penelope 13 = different bottle from Rio

---

### Analysis & Patterns

**F3 — Deep District Pattern Analysis**
Time-of-day heatmaps, day-of-week frequency, predictive modeling of when a district will drop next based on historical gaps. Builds on existing pattern panel.

**F8 — Pattern Wave Drop List Polish**
Click a wave in pattern panel → shows all stores that dropped, reverse chron. Partially built, needs polish.

**Store Leaderboard**
Ranked list of stores by total drops, quality of drops, drop frequency. Useful for planning which stores to prioritize.

**Cycle Timeline View**
Visual timeline of drops across a wave — when stores dropped relative to each other. Shows if district drops all at once or spreads out.

---

### Desktop Experience

**F7 — Desktop Data Entry Polish**
Edit existing drop entries from within the app. Bulk wave label assignment. Delete records. All syncs to Google Sheet.

**F17 — Two-Way Google Sheets Sync**
Edits made directly in the sheet reflect in app without full reload. Currently one-way (sheet → app only).

---

### Data Management

**F16 — Export / Backup**
One-click CSV export of all drops from within the app.

**Bulk Import**
Import historical data from Excel/CSV directly through the app without needing Google Colab.

---

### Store Management

**Add/Edit Stores from App**
Store management screen on desktop — currently stores only editable in Google Sheet.

**Store Notes**
Per-store freeform notes — "manager is friendly," "lottery system," "check Tuesday mornings."

**Store Visit Log**
Track when you personally visited a store, what you got, was it worth the drive.

---

### Notifications

**Push Notifications**
Reminder to check app during active drop windows based on historical district patterns.

---

## ✅ Completed Features

- Map with 79 stores, dynamic zoom pins (dot/mid/full), district colors
- Google Sheets backend — live sync, read + write (GET-based, no CORS issues)
- Wave selector, new wave creation, wave reset fix
- District filter chips (mobile) + sidebar with pattern history (desktop)
- Store cards — tabbed (Summary / Order / Bottles) with full drop history
- Log a drop — voice, paste, manual (mobile)
- Hunt mode — sorted by tier + distance + estimated drive time
- Hunt mode State/District toggle
- Distance toggle — home (#267) vs live GPS
- Desktop layout — sidebar, map, sliding detail panel
- Desktop entry panel — paste Discord text, auto-parse reporter/time/store, write to sheet
- Auto-calc MinutesSinceMidnight + DayOfWeek on entry
- Pattern analysis — per district, last 6-10 waves, predictability rating, common time window
- Mobile search — zoom + bounce pin
- Desktop search — zoom + bounce pin
- Version badge + last sync time (bottom right of map)
- Drop IDs — unique per drop, backfilled 778 rows
- Performance caching — allDrops(), getStoreStatus(), getStoreHistory(), getDropOrder() memoized
- Cache versioning — schema changes bust stale cache automatically
- F4 — Needs Review Queue (⚠️ badge, filterable overlay, sheet sync)
- F9 — Quick Drop ⚡ + Needs Logging Queue (📋 badge, detail fill queue)
- F10 — Idle Fill-In Mode (✏️ badge, missing fields task queue)
- F5 — Mobile store spotlight — tap search result → zoom map to pin at zoom 15 + auto-open store popup card
- F11 — Bottle picker UI (69 bottles, search-as-you-type, tier badges, recents, collision warnings, confirmed/absent/rumored status)
- F12 — Desktop polish (v0.4, mobile buttons hidden on desktop, sidebar controls)
- F14 — District behavior tags (Random/Day-Locked/Bulk/Unknown)
- Issues badge — desktop sidebar button with live red count, grouped issues detail panel (collision/review/bottles/reporter/link)
- Token auth on Apps Script write actions
- GitHub Pages hosting at shearmanb.github.io/drop-tracker
