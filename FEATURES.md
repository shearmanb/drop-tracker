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
Two entries use OF1924 for different bottles — Old Fitzgerald 1924 (Heaven Hill) vs Old Forester 1924 10yr (Brown-Forman). Issues Queue surfaces them but sheet write-back not yet implemented.

**SHEET-FIX — Blood Oath / Bomberger's Collision**
Row 42 in Bottles sheet incorrectly combines Blood Oath (BO12, Lux Row, tier A) and Bomberger's Declaration (Michter's, tier A) under one entry. Split into two separate rows. Remove BO12 from Bomberger's codes. Add Blood Oath as new row with codes: `BO,BO12,BloodOath,bo,bo12`.

---

## ✨ Features

### In Progress / Next Sprint

**VABC-1 — Apps Script Fetch Test** `🖥️ Desktop` *(prerequisite for VABC-2)*
Run `testVABCFetch()` in Apps Script editor to confirm whether `UrlFetchApp` can reach abc.virginia.gov without a 403. Result determines path forward for VABC-2.

```javascript
function testVABCFetch() {
  var url = 'https://www.abc.virginia.gov/products/bourbon/blood-oath-bourbon-pact-no12?productSize=0';
  var response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
  Logger.log(response.getResponseCode());
  Logger.log(response.getContentText().substring(0, 500));
}
```

**VABC-2 — VABC Metadata Enrichment** `🔁 Both` *(blocked on VABC-1 test)*
Add `vacbId` column to Bottles sheet (user fills in manually — product numbers visible on VABC product pages). Then write one-time Apps Script enrichment function that reads each `vacbId`, fetches the VABC product page, and auto-populates `vacbName`, `proof`, `price`, `size` back into the sheet. App then uses this data to:
- Link bottle chips directly to VABC product pages
- Display proof/price in bottle detail views
- Lay groundwork for future inventory lookups per store

If VABC-1 test returns 403, fallback is: `vacbId` used only for building clickable VABC links, metadata entered manually.

**F11 — BottleDrops Persistence** `🔁 Both` *(picker UI complete — sheet backend pending)*
Create BottleDrops tab in Google Sheet. Add `addBottleDrop` Apps Script action. Wire picker's confirmed/absent/rumored status through to sheet. Idle-time bottle filling with wave-keyword pre-suggestion.

---

### 📱 Mobile

**Hunt Mode Improvements**
- Auto-refresh hunt list when new drops come in
- "I'm heading there" button that starts navigation AND marks store as in-progress
- Estimated time before store likely sells out based on tier + time since drop

**Push Notifications**
Reminder to check app during active drop windows based on historical district patterns.

---

### 🖥️ Desktop

**DT-1 — Desktop Top Nav Bar**
The desktop left sidebar packs too many sections and requires scrolling. Add a horizontal tab/button bar fixed at the top of the desktop layout — one button per major section. Clicking navigates directly without scrolling. Sidebar focuses on context for the active section only.

- Candidate top-nav items: Stores | Hunt | Log Drop | Issues | Waves | Districts | Settings
- Active section highlighted
- Must not interfere with map or right detail panel
- Mobile layout unaffected

**DT-2 — Desktop → Mobile Layout Toggle**
Once in desktop mode there is no UI button to return to mobile. Add a visible toggle (e.g., in top nav or sidebar footer) that writes `forceLayout=mobile` to localStorage and reloads. Mirrors existing mobile → desktop toggle for parity.

**DT-3 — Desktop Store Panel: District Label & Font Size**
The right-side store detail panel buries the district label. Changes needed:
- District label (`D14`, `D17`, etc.) should be the visual headline at the top of the panel, large and colored per district color
- Bump base font size for the panel up slightly — currently feels cramped on a large monitor
- Store name/number remains prominent below district label

**DT-4 — Desktop Store Panel: Wave-Scoped Action Buttons**
Mobile store popup has 3 quick-action buttons: "Got one ✓", "Cleaned out", "No drop ✗". Desktop store panel has no equivalent. Add matching buttons to the desktop panel. Must clearly show which wave they apply to (e.g., "Log for: 2026.05.11 - MM BO"). Prevents accidentally logging against the wrong wave.

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

**BTL-1 — Bottle Browser / Search UI**
Dedicated view accessible from both mobile and desktop sidebar to browse the master bottle list and search drops by bottle.
- Search by bottle name, shortcode, or tier
- Filter by tier (S/A/B/C)
- For each bottle: how many drops reported it, which stores, which waves
- "Which stores had Eagle Rare this wave?" type query
- Read-only in mobile v1; desktop gets edit capability via BTL-2

**Waves Management Screen**
List all waves, set status (active/complete), add notes, set expected date. Linked from wave selector.

**Wave Creation Dialog**
Guide toward new `YYYY.MM.DD-DXX-bottles` format with district selector and date picker.

**F3 — Deep District Pattern Analysis**
Time-of-day heatmaps, day-of-week frequency, predictive modeling of when a district will drop next. Builds on existing pattern panel.

**F8 — Pattern Wave Drop List Polish**
Click a wave in pattern panel → shows all stores that dropped, reverse chron. Partially built, needs polish.

**F15 — Cycle Coverage Alerts**
"D14 is 80% done — 3 stores haven't dropped yet" style ambient alerts on map or sidebar.

**Due for a Drop Alert**
Stores that historically drop but haven't yet this cycle — highlighted specially, especially S-tier stores.

**Store Notes**
Per-store freeform notes persisted to Stores sheet `notes` column.

**Polling Sync**
Auto-detect sheet changes every 5 mins via lastModified timestamp.

**Consolidate Review Queues**
F4 Needs Review, F9 Quick Drop Queue, F10 Fill-In, and Issues Queue unified into a single triage hub with tabs or filters.

**Store Leaderboard**
Ranked list of stores by total drops, quality of drops, drop frequency.

**Cycle Timeline View**
Visual timeline of drops across a wave — when stores dropped relative to each other.

**Store Visit Log**
Track when you personally visited a store, what you got, was it worth the drive.

---

### ❓ Unknown / Unsure

**Bottle Tracking Feature (general)**
Broader bottle tracking concept discussed separately — full spec TBD. May overlap with F11/BTL features. Needs clarification before breaking into tasks.

**Bulk Import**
Import historical data from Excel/CSV. Scope unclear — mobile, desktop, or backend script.

---

## ✅ Completed Features

### 📱 Mobile
- F5 — Mobile store spotlight — tap search result → zoom map to pin at zoom 15 + auto-open store popup ✅
- Mobile search — zoom + bounce pin (no auto-popup) ✅
- Log a drop — voice, paste, manual ✅
- Hunt mode — sorted by tier + distance + estimated drive time ✅
- Hunt mode State/District toggle ✅
- Distance toggle — home (#267) vs live GPS ✅
- District filter chips ✅

### 🖥️ Desktop
- **DT-5** — Desktop store past drops renders bottle chips instead of raw strings ✅
- F12 — Desktop polish (v0.4, mobile buttons hidden, sidebar controls) ✅
- Desktop layout — sidebar, map, sliding detail panel ✅
- Desktop entry panel — paste Discord text, auto-parse reporter/time/store, write to sheet ✅
- Desktop search — zoom + bounce pin (no auto-panel) ✅
- Issues badge — desktop sidebar with live red count, grouped issues panel ✅

### 🔁 Both
- **BTL-AUDIT** — Confirmed BOTTLES was hardcoded in index.html ✅
- **BTL-MIGRATE** — BOTTLES now loaded from Google Sheets Bottles tab; `cachedBottles` localStorage fallback; hardcoded array removed; CACHE_VERSION → 5 ✅
- Map with 79 stores, dynamic zoom pins (dot/mid/full), district colors ✅
- Google Sheets backend — live sync, read + write ✅
- Wave selector, new wave creation, wave reset fix ✅
- Store cards — tabbed (Summary / Order / Bottles) with full drop history ✅
- Auto-calc MinutesSinceMidnight + DayOfWeek on entry ✅
- Pattern analysis — per district, last 6-10 waves, predictability rating, common time window ✅
- Version badge + last sync time ✅
- Drop IDs — unique per drop, backfilled 778 rows ✅
- Performance caching — allDrops(), getStoreStatus(), getStoreHistory(), getDropOrder() memoized ✅
- Cache versioning — schema changes bust stale cache automatically ✅
- F4 — Needs Review Queue (⚠️ badge, filterable overlay, sheet sync) ✅
- F9 — Quick Drop ⚡ + Needs Logging Queue (📋 badge, detail fill queue) ✅
- F10 — Idle Fill-In Mode (✏️ badge, missing fields task queue) ✅
- F11 — Bottle picker UI (69 bottles, search-as-you-type, tier badges, recents, collision warnings) ✅
- F14 — District behavior tags (Random/Day-Locked/Bulk/Unknown) ✅
- Issues queue — collision, review, missing bottles/reporter/link ✅
- Token auth on Apps Script write actions ✅
- GitHub Pages hosting at shearmanb.github.io/drop-tracker ✅
