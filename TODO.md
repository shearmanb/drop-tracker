# Bourbon Drop Tracker — Master TODO

Last updated: May 14, 2026
App live at: https://shearmanb.github.io/drop-tracker
Current version: v0.4

---

## 🔴 HIGH PRIORITY — Fix Next

- [ ] Test bottle picker in both entry panel and mobile modal
- [ ] Test issues queue — verify collision resolver, review edit, bottles save all write to sheet
- [ ] Test Quick Drop ⚡ flow end to end
- [ ] Verify v0.4 loads cleanly (no console errors)
- [ ] Add issues badge count to desktop sidebar

---

## 🟡 DATA CLEANUP (do when you have time)

- [ ] Normalize ReportedTS timestamps — inconsistent formats across 778 rows
- [ ] Rename old wave labels to new `YYYY.MM.DD-DXX-bottles` format
- [ ] Audit drops with no wave label (in Needs Review / Issues queue)
- [ ] Resolve all OF1924 collisions via Issues queue

---

## 🟡 FEATURES TO BUILD

- [ ] Waves management screen — list waves, set status (active/complete), add notes, expected date
- [ ] Store notes — add/edit per-store freeform notes, persisted to Stores sheet `notes` column
- [ ] Polling sync — auto-detect sheet changes every 5 mins via lastModified timestamp
- [ ] Wave creation dialog — guide toward new `YYYY.MM.DD-DXX-bottles` format with district selector
- [ ] Bottle tracking feature (spec TBD — from other chat, needs clarification)
- [ ] Consolidate review queues — F4 Needs Review, F9 Quick Drop Queue, F10 Fill-In, Issues Queue should feel unified

---

## 🟢 LOWER PRIORITY — Backlog

- [ ] F3 — Deep district pattern analysis: time-of-day heatmaps, day-of-week frequency, predictive next-wave modeling
- [ ] F7 — Desktop data entry polish: edit existing entries, bulk wave label assignment, delete records
- [ ] F15 — Cycle coverage alerts: "D14 is 80% done — 3 stores left"
- [ ] F16 — Export/backup: one-click CSV export from app
- [ ] F17 — Two-way Google Sheets sync
- [ ] B1 — OF1924 collision auto-flag (now handled by Issues Queue, but needs sheet write-back)
- [ ] Store leaderboard view
- [ ] Cycle timeline view
- [ ] Store visit log (did I go, was it worth it)
- [ ] Add/edit stores from within app
- [ ] Push notifications
- [ ] "Due for a drop" alert for overdue S-tier stores
- [ ] Bulk import from Excel/CSV
- [ ] Hunt mode improvements (auto-refresh, "heading there" button)

---

## ✅ COMPLETED

- [x] Map with 79 stores, dynamic zoom pins (dot → mid → full), district colors
- [x] Google Sheets backend — live sync read + write (GET-based, no CORS issues)
- [x] Wave selector, new wave creation, wave reset bug fix
- [x] District filter chips (mobile) + sidebar with pattern history (desktop)
- [x] Store cards — TABBED (Summary / Order / Bottles) with full drop history
- [x] Store popup: common drop time, drop order in district, pattern mode per wave
- [x] Log a drop — voice input, Discord paste parser, manual entry
- [x] Quick Drop ⚡ + Needs Logging Queue (📋 badge)
- [x] Hunt mode — sorted by tier + distance + estimated drive time
- [x] Hunt mode State/District toggle
- [x] Distance toggle — 🏠 home (#267) vs 📍 live GPS
- [x] Desktop layout — left sidebar, center map, right sliding detail panel
- [x] Desktop entry panel — paste Discord text, auto-parse reporter/time/store #
- [x] Bottle picker — 69-bottle master list, search-as-you-type, tier badges, recents, collision warnings
- [x] Bottle chips display in store history (tier-colored badges)
- [x] Issues Queue — OF1924 collision, needs review, missing bottles/reporter/link
- [x] F4 — Needs Review Queue (⚠️ badge)
- [x] F10 — Idle Fill-In Mode (✏️ badge)
- [x] F11 — District Analytics (📊) — predictability, common time, day of week, wave frequency, due status
- [x] F12 — Desktop polish (hidden mobile buttons, sidebar controls, v0.4)
- [x] F14 — District behavior tags (Random/Day-Locked/Bulk/Unknown)
- [x] Auto-calculate MinutesSinceMidnight + DayOfWeek on entry
- [x] Pattern analysis — per district, last 6-10 waves, predictability rating, common time window
- [x] Mobile search — zoom + bounce pin (no auto-popup)
- [x] Desktop search — zoom + bounce pin (no auto-panel)
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
