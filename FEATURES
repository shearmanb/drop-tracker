# Bourbon Drop Tracker — Feature Backlog

## 🔧 Bugs / Data Issues

**B1 — OF1924 Collision Flag**
Two entries use OF1924 for different bottles — Old Fitzgerald 1924 (Heaven Hill) vs Old Forester 1924 10yr (Brown-Forman). Flag these in the Drops sheet for review during idle mode.

---

## ✨ Features

### In Progress / Next Sprint

**F4 — Needs Review Queue**
Surface the 121 drops flagged needsReview=true (missing wave labels, incomplete data). Show in a filterable list. Let user assign wave labels, fix timestamps, mark complete. Sync corrections back to Google Sheet.

**F5 — Mobile Store Spotlight**
When user taps a search result in mobile search overlay, close overlay, zoom map to that pin at zoom 15, auto-open the store card popup.

**F9 — Quick Drop + Needs Logging Queue**
Add "Quick Drop ⚡" button to store card (one tap, no form, pin goes green instantly). Add "Log Details" second button. Add 📋 badge in header showing count of quick-logged drops needing details. Tapping badge opens queue overlay showing each pending drop with amber tags for missing fields (bottles, reporter, discord link). "Fill In Details" opens entry panel pre-filled with store # and timestamp.

**F10 — Idle Time Mode**
A "Fill In" button that surfaces data quality tasks as a card-by-card queue — missing bottles, missing reporters, missing discord links, untiered stores, unlabeled waves. Easiest/quickest tasks first. One card at a time, skip or complete.

**F12 — Desktop Polish**
Fix layout issues, ensure hunt/dist-toggle hidden on desktop, version bump to v0.3.

**F14 — District Behavior Tags**
Each district tagged as Random / Day-Locked / Bulk / Unknown. Set once by user. Shows in sidebar and pattern panel. Informs hunting decisions.

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
- Google Sheets backend — live sync, read + write
- Wave selector, new wave creation, wave reset fix
- District filter chips (mobile) + sidebar with pattern history (desktop)
- Store cards with full history, Discord links, tier badges, HH22/BB30 flags
- Log a drop — voice, paste, manual (mobile)
- Hunt mode — sorted by tier + distance + estimated drive time
- Distance toggle — home (#267) vs live GPS
- Desktop layout — sidebar, map, sliding detail panel
- Desktop entry panel — paste Discord text, auto-parse reporter/time/store, write to sheet
- Auto-calc MinutesSinceMidnight + DayOfWeek on entry
- Pattern analysis — per district, last 6-10 waves, predictability rating, common time window
- Mobile search overlay — 🔍 button, full screen, zoom + open card on tap
- Version badge + last sync time (bottom right of map)
- GitHub hosted at shearmanb.github.io/drop-tracker
