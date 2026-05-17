# Bourbon Drop Tracker — Feature Backlog

> **Layout key for all sections:**
> - 📱 Mobile only
> - 🖥️ Desktop only
> - 🔁 Both modes
> - ❓ Unknown / needs clarification before scoping

---

## 🔧 Bugs / Data Issues

### 🔁 Both

**B1 — OF1924 Collision Flag**
Two entries use OF1924 for different bottles — Old Fitzgerald 1924 (Heaven Hill) vs Old Forester 1924 10yr (Brown-Forman). Flag these in the Drops sheet for review during idle mode. Issues Queue surfaces them but sheet write-back not yet implemented.

---

## ✨ Features

### In Progress / Next Sprint

**F11 — BottleDrops Persistence** *(picker UI complete — sheet backend pending)* `🔁 Both`
Create Bottles + BottleDrops tabs in Google Sheet. Add `getBottles` and `addBottleDrop` Apps Script actions. Wire picker's confirmed/absent/rumored status through to sheet. Idle-time bottle filling with wave-keyword pre-suggestion.

---

### 📱 Mobile

**F5 — Store Spotlight** ✅ *Complete*
Tap search result → zoom map to pin at zoom 15, auto-open store card. Done.

**Hunt Mode Improvements**
- Auto-refresh hunt list when new drops come in
- "I'm heading there" button that starts navigation AND marks store as in-progress
- Estimated time before store likely sells out based on tier + time since drop

**Push Notifications**
Reminder to check app during active drop windows based on historical district patterns.

---

### 🖥️ Desktop

**DT-1 — Desktop Top Nav Bar**
The desktop left sidebar packs too many sections and requires scrolling to reach them. Add a horizontal tab/button bar fixed at the top of the desktop layout — one button per major section. Clicking navigates directly without scrolling. Sidebar can focus on context for the active section only.

- Candidate top-nav items: Stores | Hunt | Log Drop | Issues | Waves | Districts | Settings
- Active section highlighted
- Must not interfere with map or right detail panel
- Mobile layout is unaffected

**DT-2 — Desktop → Mobile Layout Toggle**
Once in desktop mode there is no UI button to return to mobile. Add a visible toggle (e.g., in top nav or sidebar footer) that writes `forceLayout=mobile` to localStorage and reloads. Mirrors the existing mobile → desktop toggle for parity.

**DT-3 — Desktop Store Panel: District Label & Font Size**
The right-side store detail panel buries the district label. Changes needed:
- District label (`D14`, `D17`, etc.) should be the visual headline at the top of the panel, large and colored per district color
- Bump base font size for the panel up slightly — currently feels cramped on a large monitor
- Store name/number should remain prominent below the district label

**DT-4 — Desktop Store Panel: Wave-Scoped Action Buttons**
Mobile store popup has 3 quick-action buttons: "Got one ✓", "Cleaned out", "No drop ✗". Desktop store panel has no equivalent. Add matching buttons to the desktop panel. The buttons must clearly show which wave they apply to (e.g., label the section "Log for: 2026.05.11 - MM BO" using the current wave). This prevents accidentally logging against the wrong wave.

**DT-5 — Desktop Past Drops: Bottle Name Rendering**
In desktop mode, the "Past Drops" tab on the store detail panel shows raw freeform bottle strings from old data instead of normalized bottle chips/badges. Update to render bottle chips identically to the mobile store card — tier-colored, shortcode badges, collision warnings where applicable.

**F7 — Desktop Data Entry Polish**
Edit existing drop entries from within the app. Bulk wave label assignment. Delete records. All syncs to Google Sheet.

**BTL-2 — Bottle Edit UI**
Allow editing master bottle list records from within the app without going to Google Sheets directly.
- Edit: name, shortcode, tier, collision flag, notes
- Add new bottles
- Mark as deprecated/removed from VABC allocation
- Writes to Bottles sheet tab via Apps Script `updateBottle` action
- Desktop only for v1

**Add/Edit Stores**
Store management screen — currently stores only editable in Google Sheet.

**F16 — Export / Backup**
One-click CSV export of all drops from within the app.

**F17 — Two-Way Google Sheets Sync**
Edits made directly in the sheet reflect in app without full reload. Currently one-way (sheet → app only).

---

### 🔁 Both

**Waves Management Screen**
List all waves, set status (active/complete), add notes, set expected date. Linked from wave selector.

**Wave Creation Dialog**
Guide toward new `YYYY.MM.DD-DXX-bottles` format with district selector and date picker.

**BTL-1 — Bottle Browser / Search UI**
Dedicated view accessible from both mobile and desktop sidebar to browse the master bottle list and search drops by bottle.
- Search by bottle name, shortcode, or tier
- Filter by tier (S/A/B/C)
- For each bottle: how many drops reported it, which stores, which waves
- "Which stores had Eagle Rare this wave?" type query
- Read-only in mobile v1; desktop gets edit capability via BTL-2

**BTL-AUDIT — Bottle List Source of Truth**
Current status unclear: the 69-bottle master list may be hardcoded in `index.html` rather than (or in addition to) living in a Google Sheet tab. Before building BTL-1/BTL-2, confirm:
- Is the master list loaded from Sheets at startup (like Stores/Drops)?
- Is there a `Bottles` sheet tab yet, or is it still pending from F11?
- Any bottle data in localStorage that could become stale?

Goal: single source of truth in Google Sheets, app reads it fresh on load like other data.

**F3 — Deep District Pattern Analysis**
Time-of-day heatmaps, day-of-week frequency, predictive modeling of when a district will drop next based on historical gaps. Builds on existing pattern panel.

**F8 — Pattern Wave Drop List Polish**
Click a wave in pattern panel → shows all stores that dropped, reverse chron. Partially built, needs polish.

**F15 — Cycle Coverage Alerts**
"D14 is 80% done — 3 stores haven't dropped yet" style ambient alerts on the map or sidebar.

**Due for a Drop Alert**
Stores that historically drop but haven't yet this cycle — highlighted specially, especially S-tier stores.

**Store Notes**
Per-store freeform notes — "manager is friendly," "lottery system," "check Tuesday mornings." Persisted to Stores sheet `notes` column.

**Polling Sync**
Auto-detect sheet changes every 5 mins via lastModified timestamp. Show banner when new data is available.

**Consolidate Review Queues**
F4 Needs Review, F9 Quick Drop Queue, F10 Fill-In, and Issues Queue currently feel separate. Unify into a single review/triage hub with tabs or filters.

**Store Leaderboard**
Ranked list of stores by total drops, quality of drops, drop frequency. Useful for planning which stores to prioritize.

**Cycle Timeline View**
Visual timeline of drops across a wave — when stores dropped relative to each other. Shows if district drops all at once or spreads out.

**Store Visit Log**
Track when you personally visited a store, what you got, was it worth the drive.

---

### ❓ Unknown / Unsure

**Bottle Tracking Feature (general)**
A broader bottle tracking concept was discussed in a separate chat — full spec TBD. Overlaps with F11/BTL features but may include additional scope. Needs clarification before breaking into tasks.

**Bulk Import**
Import historical data from Excel/CSV directly through the app. Unclear if this is a mobile need, desktop only, or backend script. Needs scoping.

---

## ✅ Completed Features

### 📱 Mobile
- F5 — Mobile store spotlight — tap search result → zoom map to pin at zoom 15 + auto-open store popup card ✅
- Mobile search — zoom + bounce pin (no auto-popup) ✅
- Log a drop — voice, paste, manual (mobile) ✅
- Hunt mode — sorted by tier + distance + estimated drive time ✅
- Hunt mode State/District toggle ✅
- Distance toggle — home (#267) vs live GPS ✅
- District filter chips (mobile) ✅

### 🖥️ Desktop
- F12 — Desktop polish (v0.4, mobile buttons hidden on desktop, sidebar controls) ✅
- Desktop layout — sidebar, map, sliding detail panel ✅
- Desktop entry panel — paste Discord text, auto-parse reporter/time/store, write to sheet ✅
- Desktop search — zoom + bounce pin (no auto-panel) ✅
- Issues badge — desktop sidebar button with live red count, grouped issues detail panel ✅
- Sidebar with pattern history ✅

### 🔁 Both
- Map with 79 stores, dynamic zoom pins (dot/mid/full), district colors ✅
- Google Sheets backend — live sync, read + write (GET-based, no CORS issues) ✅
- Wave selector, new wave creation, wave reset fix ✅
- Store cards — tabbed (Summary / Order / Bottles) with full drop history ✅
- Store popup: common drop time, drop order in district, pattern mode per wave ✅
- Auto-calc MinutesSinceMidnight + DayOfWeek on entry ✅
- Pattern analysis — per district, last 6-10 waves, predictability rating, common time window ✅
- Version badge + last sync time (bottom right of map) ✅
- Drop IDs — unique per drop, backfilled 778 rows ✅
- Performance caching — allDrops(), getStoreStatus(), getStoreHistory(), getDropOrder() memoized ✅
- Cache versioning — schema changes bust stale cache automatically ✅
- F4 — Needs Review Queue (⚠️ badge, filterable overlay, sheet sync) ✅
- F9 — Quick Drop ⚡ + Needs Logging Queue (📋 badge, detail fill queue) ✅
- F10 — Idle Fill-In Mode (✏️ badge, missing fields task queue) ✅
- F11 — Bottle picker UI (69 bottles, search-as-you-type, tier badges, recents, collision warnings, confirmed/absent/rumored status) ✅
- F14 — District behavior tags (Random/Day-Locked/Bulk/Unknown) ✅
- Issues queue — collision, review, missing bottles/reporter/link ✅
- Token auth on Apps Script write actions ✅
- GitHub Pages hosting at shearmanb.github.io/drop-tracker ✅
</content>
</invoke>