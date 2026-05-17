# Bourbon Drop Tracker — Master TODO

Last updated: May 17, 2026
App live at: https://shearmanb.github.io/drop-tracker
Current version: v0.4

> **Layout key for all sections below:**
> - 📱 Mobile only
> - 🖥️ Desktop only
> - 🔁 Both modes
> - ❓ Unknown / needs clarification before scoping

---

## 🔴 HIGH PRIORITY — Fix Next

### 🔁 Both
- [ ] Test bottle picker in both entry panel and mobile modal
- [ ] Test issues queue — verify collision resolver, review edit, bottles save all write to sheet
- [ ] Test Quick Drop ⚡ flow end to end
- [ ] Verify v0.4 loads cleanly (no console errors)
- [ ] F11 — Add bottle status (confirmed/absent/rumored) dropdown to picker chips — UI added, needs BottleDrops sheet tab + Apps Script actions to actually persist

### 🖥️ Desktop
- [ ] **VABC-1 — Test Apps Script VABC fetch**: run `testVABCFetch()` in Apps Script editor to confirm whether `UrlFetchApp` can reach abc.virginia.gov (returns 200 vs 403). Result determines whether VABC metadata enrichment can be automated or is links-only. See FEATURES.md VABC section.

### ❓ Unknown / Unsure
- [ ] **SHEET-FIX** — Fix Blood Oath / Bomberger's collision in Bottles sheet: row 42 currently has both under "Bomberger's Declaration" with code `BO12`. Split into two rows — Bomberger's (remove BO12) and Blood Oath (BO12, tier A, brand Lux Row). Add after row 69.

---

## 🟡 DATA CLEANUP (do when you have time)

### 🔁 Both (backend / sheet data)
- [ ] Normalize ReportedTS timestamps — inconsistent formats across 778 rows
- [ ] Rename old wave labels to new `YYYY.MM.DD-DXX-bottles` format
- [ ] Audit drops with no wave label (in Needs Review / Issues queue)
- [ ] Resolve all OF1924 collisions via Issues queue
- [ ] Audit remaining bottle codes in Bottles sheet for other collisions or wrong assignments

---

## 🟡 FEATURES TO BUILD

### 📱 Mobile
- [ ] Hunt mode improvements — auto-refresh hunt list when new drops come in; "heading there" button starts nav + marks in-progress
- [ ] Push notifications — reminder to check app during active drop windows based on district patterns

### 🖥️ Desktop
- [ ] **DT-1** — Desktop top nav bar: sidebar has too much content requiring scroll. Add a horizontal tab bar across the top of the desktop layout (Stores, Hunt, Log, Issues, Waves, etc.) so primary actions are always visible without scrolling.
- [ ] **DT-2** — Desktop → mobile toggle: no visible button to switch back to mobile. Add a layout toggle (visible in desktop mode) that writes `forceLayout=mobile` and reloads. Mirrors existing mobile → desktop toggle for parity.
- [ ] **DT-3** — Desktop store panel: district label prominence — make district label (`D14`, `D17`, etc.) the visual headline at the top of the right panel, large and colored per district. Bump overall panel font size up slightly.
- [ ] **DT-4** — Desktop store panel: wave-scoped action buttons — add the 3-button row from mobile (Got one ✓ / Cleaned out / No drop ✗) to the desktop store detail panel. Clearly label which wave they apply to (e.g., "Log for: 2026.05.11 - MM BO") so there is no ambiguity.
- [ ] **F7** — Desktop data entry polish: edit existing drop entries, bulk wave label assignment, delete records. All syncs to Google Sheet.
- [ ] **BTL-2** — Bottle edit UI (desktop): edit master bottle list records (name, shortcode, tier, collision flag) from within the app. Add new bottles. Mark deprecated. Writes to Bottles sheet via Apps Script.
- [ ] Add/edit stores from within app (desktop store management screen)
- [ ] F16 — Export/backup: one-click CSV export from app

### 🔁 Both
- [ ] **VABC-2** — VABC metadata enrichment: once VABC-1 test confirms feasibility, user enters `vacbId` for each bottle in Bottles sheet, then runs one-time Apps Script to auto-populate `vacbName`, `proof`, `price`, `size` from VABC product pages. App then links bottle chips directly to VABC product pages.
- [ ] **BTL-1** — Bottle browser / search UI: dedicated view to browse master bottle list, search by name/shortcode/tier, see which stores reported a bottle in current or past waves. Accessible from both mobile and desktop.
- [ ] Waves management screen — list waves, set status (active/complete), add notes, expected date
- [ ] Wave creation dialog — guide toward `YYYY.MM.DD-DXX-bottles` format with district selector
- [ ] Store notes — add/edit per-store freeform notes, persisted to Stores sheet `notes` column
- [ ] Polling sync — auto-detect sheet changes every 5 mins via lastModified timestamp
- [ ] Consolidate review queues — F4 Needs Review, F9 Quick Drop Queue, F10 Fill-In, Issues Queue should feel unified
- [ ] F3 — Deep district pattern analysis: time-of-day heatmaps, day-of-week frequency, predictive next-wave modeling
- [ ] F15 — Cycle coverage alerts: "D14 is 80% done — 3 stores left"
- [ ] F17 — Two-way Google Sheets sync
- [ ] B1 — OF1924 collision auto-flag (now handled by Issues Queue, but needs sheet write-back)
- [ ] Store leaderboard view
- [ ] Cycle timeline view
- [ ] Store visit log (did I go, was it worth it)
- [ ] "Due for a drop" alert for overdue S-tier stores

### ❓ Unknown / Unsure
- [ ] Bottle tracking feature — spec TBD, needs clarification on exact scope
- [ ] Bulk import from Excel/CSV — unclear if mobile or desktop, or both

---

## ✅ COMPLETED

### 📱 Mobile
- [x] F5 — Mobile store spotlight — tap search result → zoom to pin at zoom 15 + auto-open store popup
- [x] Mobile search — zoom + bounce pin (no auto-popup)
- [x] Log a drop — voice input, Discord paste parser, manual entry
- [x] Hunt mode — sorted by tier + distance + estimated drive time
- [x] Hunt mode State/District toggle
- [x] Distance toggle — 🏠 home (#267) vs 📍 live GPS
- [x] District filter chips (mobile)

### 🖥️ Desktop
- [x] **DT-5** — Desktop store past drops now renders bottle chips (tier-colored badges) instead of raw freeform strings
- [x] F12 — Desktop polish (v0.4, mobile buttons hidden, sidebar controls)
- [x] Desktop layout — left sidebar, center map, right sliding detail panel
- [x] Desktop entry panel — paste Discord text, auto-parse reporter/time/store #, write to sheet
- [x] Desktop search — zoom + bounce pin (no auto-panel)
- [x] Issues badge — desktop sidebar button with live red count, opens issues detail panel
- [x] Sidebar with pattern history

### 🔁 Both
- [x] **BTL-AUDIT** — Confirmed BOTTLES master list was hardcoded in index.html; migrated to Google Sheets Bottles tab
- [x] **BTL-MIGRATE** — BOTTLES now loaded from Google Sheets at startup via `getBottles` Apps Script action; `cachedBottles` localStorage fallback; hardcoded array removed; CACHE_VERSION bumped to 5
- [x] F4 — Needs Review Queue (⚠️ badge, overlay, sheet sync)
- [x] F9 — Quick Drop ⚡ + Needs Logging Queue (📋 badge, detail fill queue)
- [x] F10 — Idle Fill-In Mode (✏️ badge, missing fields task queue)
- [x] F11 — Bottle picker UI (69 bottles, search, recents, tier badges, collision warnings) — BottleDrops sheet tab pending
- [x] F14 — District behavior tags (Random/Day-Locked/Bulk/Unknown)
- [x] F11 — District Analytics (📊) — predictability, common time, day of week, wave frequency, due status
- [x] Map with 79 stores, dynamic zoom pins (dot → mid → full), district colors
- [x] Google Sheets backend — live sync read + write (GET-based, no CORS issues)
- [x] Wave selector, new wave creation, wave reset bug fix
- [x] Store cards — TABBED (Summary / Order / Bottles) with full drop history
- [x] Store popup: common drop time, drop order in district, pattern mode per wave
- [x] Bottle picker — 69-bottle master list, search-as-you-type, tier badges, recents, collision warnings
- [x] Bottle chips display in store history (tier-colored badges)
- [x] Issues Queue — OF1924 collision, needs review, missing bottles/reporter/link
- [x] Auto-calculate MinutesSinceMidnight + DayOfWeek on entry
- [x] Pattern analysis — per district, last 6-10 waves, predictability rating, common time window
- [x] Version badge + last sync time (bottom right of map)
- [x] Drop IDs — unique per drop, backfilled 778 rows, `SRC-YYYYMMDD-HHMMSS-STOREID-SEQ` format
- [x] Store coordinates fixed via Apps Script geocoding (79 stores)
- [x] Parallel data fetch (stores + drops + patterns simultaneously)
- [x] Performance caching — allDrops(), getStoreStatus(), getStoreHistory(), getDropOrder() all memoized
- [x] Cache versioning — schema changes bust stale cache automatically
- [x] Dynamic district list — derived from Stores sheet, not hardcoded
- [x] Auto-detect current wave on load
- [x] Error boundary on store popup
- [x] Token auth on Apps Script write actions
- [x] Write validation in Apps Script (store ID, result, wave label)
- [x] Batch updateDrop in Apps Script (one setValues call)
- [x] GitHub Pages hosting at shearmanb.github.io/drop-tracker
