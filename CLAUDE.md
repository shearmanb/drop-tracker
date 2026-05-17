# Bourbon Drop Tracker — Claude Code Context

## What This App Is
A PWA for tracking Virginia ABC bourbon drops in Northern Virginia. Single HTML file (`index.html`), hosted on GitHub Pages, backend is Google Sheets via Apps Script.

**Live app:** https://shearmanb.github.io/drop-tracker  
**Repo:** https://github.com/shearmanb/drop-tracker  
**Deploy:** Edit `index.html` → `git add -A && git commit -m "description" && git push`  
**GitHub Pages auto-deploys in ~60 seconds after push.**

---

## Tech Stack — Read This Before Touching Code
- **Single HTML file** — all HTML, CSS, and JS in `index.html`. No build process, no npm, no frameworks.
- **Leaflet.js** for maps (loaded from CDN)
- **Google Sheets** as database via Apps Script web endpoint
- **localStorage** for offline cache and pending drops queue
- **No terminal access needed for deployment** — git push is all it takes

**Apps Script URL:**  
`https://script.google.com/macros/s/AKfycbzFjkKeNmvRXkxe2nj0I58wrwcgRLud97job4_2c3DQaHRf3lvGHRY5hvx-W429F6pg/exec`

**Google Sheet ID:** `1BPPZsFvoeNWiH5rC8x3PSsKUOEq7GhPhD5qgEC5DWy4`  
**Sheet tabs:** Stores, Drops, Waves, Patterns

---

## CRITICAL Coding Rules

1. **NEVER use `const` to override or wrap existing functions** — causes hoisting errors in vanilla JS. Use `function` declarations or reassign with `=`.
2. **`initAndDetect()` call must be at the very bottom of the script**, after ALL functions are defined.
3. **Always update BOTH map instances** when changing markers or store status — `map` (mobile) and `desktopMap` (desktop).
4. **Desktop layout** = `body.desktop` CSS class. Mobile is default. Never assume desktop.
5. **When updating Apps Script**, always redeploy as "New Version" — redeploying same version does nothing.
6. **Test in Chrome with F12 console open** before declaring done. Check for JS errors on load.

---

## Architecture

### Two map instances
```
map          = mobile Leaflet map  (id="map")
desktopMap   = desktop Leaflet map (id="desktop-map")
```
Both must be kept in sync whenever markers, status, or wave changes.

### Data flow
1. App loads → `loadFromSheet()` fetches Stores, Drops, Patterns from Apps Script
2. Falls back to `localStorage` cache if fetch fails
3. `pendingDrops` (localStorage) = quick-logged drops not yet synced to sheet
4. `allDrops()` = `[...DROPS, ...pendingDrops]` — always use this, never DROPS alone
5. All sheet writes go through `?action=addDrop` POST to Apps Script

### localStorage keys
- `cachedStores` — JSON array of stores
- `cachedDrops` — JSON array of drops
- `cachedPatterns` — JSON array of patterns
- `cacheTime` — timestamp of last sheet sync
- `pendingDrops` — quick-logged drops not yet flushed to sheet
- `forceLayout` — "desktop" or "mobile" layout override
- `quickDropItems` — quick-logged drops pending detail entry
- `recentBottles` — array of recently used bottle IDs (up to 8)
- `issueCorrections` — pending issue queue corrections not yet synced
- `districtBehaviors` — per-district behavior tag overrides (Random/Day-Locked/Bulk/Unknown)

### Key global variables
```js
STORES        // array of store objects
DROPS         // array of drop objects from sheet
PATTERNS      // array of pattern objects from sheet
currentWave   // currently selected wave label string
activeDistricts // Set — "ALL" or Set of "D14" etc
pendingDrops  // array — quick-logged drops in localStorage
markers       // object — mobile map markers by storeId
desktopMarkers // object — desktop map markers by storeId
quickDropItems  // array — quick-logged drops pending detail entry
fillinTasks   // array — current idle fill-in task queue
fillinIdx     // number — current position in fillinTasks
issueFilter   // string — current issues queue filter
issueCorrections // object — pending issue corrections not yet synced
```

---

## Data Model

### Store object (from Stores sheet)
```js
{
  id: Number,          // 2-3 digit store number — PRIMARY KEY
  label: String,       // city/location name e.g. "McLean"
  district: String,    // "D14" format — ALWAYS capital D + number
  address: String,
  qRank: Number,       // quality rank 1-3 scale
  tier: String,        // S/A/B/C
  sRank: Number,       // sales rank within district
  sRankLabel: String,  // "3 / 17" format
  hh22: Boolean,       // got Heaven Hill 22
  bb30: Boolean,       // got Blade and Bow 30
  lat: Number,
  lng: Number
}
```

### Drop object (from Drops sheet)
```js
{
  wave: String,        // "YYYY.MM.DD - Description"
  storeId: Number,
  district: String,    // "D14" format
  result: String,      // "drop" / "no_drop" / "unknown"
  timestamp: String,   // "YYYY-MM-DDTHH:MM" EST
  reporter: String,
  bottles: String,     // freeform for now
  notes: String,
  discordLink: String,
  dropQuality: Number, // 1-3
  topBottle: Boolean,
  minutesSinceMidnight: Number,  // auto-calculated
  dayOfWeek: Number,   // 1=Sunday, 7=Saturday
  hellcatNotes: String,
  truckNotes: String,
  needsReview: Boolean
}
```

### Wave label format
`YYYY.MM.DD - Description` e.g. `2026.04.27 - MM BO EHT`

### Drop result values
- `drop` = confirmed drop happened
- `no_drop` = confirmed nothing released
- `unknown` / blank = no data

---

## District Colors & Priority
```js
D14: "#f59e0b"  // amber   — HOME district, highest priority
D17: "#2563eb"  // cobalt blue
D18: "#10b981"  // emerald green
D07: "#ef4444"  // red
D20: "#06b6d4"  // teal
D16: "#64748b"  // slate
D12: "#475569"  // dark slate
```

District z-index (pin layering — D14 renders on top):
`D14:700, D17:600, D18:500, D07:400, D20:300, D16:200, D12:100`

---

## Domain Knowledge

### What is a "drop"?
Virginia ABC is state-controlled liquor. Allocated bourbon is distributed by district. Each District Manager decides which stores get what. A "drop" = a store puts allocated bottles out for sale. Reports come from Discord.

### Discord report format
```
Reporter — M/D/YY, H:MM AM/PM
!drop [store#] [bottles]
```

### Waves
One allocation cycle, roughly weekly per district. Different districts can share a wave name. Older unlabeled waves exist — `needsReview=true`.

### Store 267
User's closest store — McLean area. Used as home reference for distance calc when `distMode = 'home'`.

### Distance calculation
Straight-line × 1.5 suburban factor ÷ 35mph = estimated drive time. Not GPS routing — good enough for triage.

### Tier mapping (qRank 1-3 scale)
- S tier: 2.5–3.0 (shown as 8.3–10 on /10 scale)
- A tier: 2.0–2.49
- B tier: 1.3–1.99
- C tier: 0–1.29

---

## Key Bottle Shortcodes (common ones in data)
| Code | Bottle | Notes |
|---|---|---|
| ER | Eagle Rare 10yr | NOT 17yr — only 10yr at VA ABC |
| RR | Russell's Reserve SiB | NOT Rabbit Hole |
| EHT / EHTsm | EH Taylor Small Batch | Most common EHT |
| ETL | Elmer T. Lee | Buffalo Trace product, NOT Heaven Hill |
| MTBF | Michter's Toasted Barrel | NOT Penelope |
| PTB | Penelope Toasted | NOT MTBF |
| OF1924 | ⚠️ COLLISION | Could be OFitz 1924 (HH) OR Old Forester 1924 (BF) — flag for review |
| Stagg / GTS | George T. Stagg | BTAC annual |
| HH22 | Heaven Hill 22yr | Most sought after |
| OF11 | Old Fitzgerald 11yr BiB | Heaven Hill fall release |

---

## Apps Script Actions
| Action | Method | Notes |
|---|---|---|
| getStores | GET | All rows from Stores tab |
| getDrops | GET | All rows from Drops tab |
| getPatterns | GET | All rows from Patterns tab |
| addDrop | POST | Appends one row to Drops tab |
| addWave | POST | Appends one row to Waves tab |

---

## Current Version & Feature Backlog
See `TODO.md` for full prioritized backlog.  
See `FEATURES.md` for detailed feature specs.  
See `F11_BOTTLES_SPEC.md` for bottle system spec.  
See `DATAMODEL.md` for full data model reference.

**Current version:** v0.4  
**Season status:** Off-season (as of May 2026) — no active waves. Resume tracking when next allocation cycle begins.

### Next up (when season resumes)
- **F11** — BottleDrops sheet tab + Apps Script actions (picker UI is done; persistence is not)
- **Waves management** — list waves, set status, add notes, expected date
- **DT-1** — Desktop top nav bar (sidebar too crowded)
- **Data cleanup** — normalize timestamps, rename old wave labels, resolve OF1924 collisions

### Completed this session (May 17, 2026)
- Map tile switched from CartoDB Dark Matter → Voyager (better road/street visibility, Google Maps-like clarity)
- Inset border frame added to both map wrappers (mobile + desktop) to distinguish map from UI chrome

---

## CSS Variables (design system)
```css
--bg: #0d1117
--surface: #161b22
--surface2: #21262d
--border: #30363d
--text: #e6edf3
--muted: #7d8590
--muted2: #484f58
--accent: #f59e0b   /* amber — primary action color */
```

---

## User Context
- Solo user hunting NoVA ABC stores for allocated bourbon
- Uses app on iPhone while driving/hunting (mobile-first!) and at home on desktop
- Not a developer — keep instructions simple, no jargon
- Deploys by running `git add -A && git commit -m "..." && git push`
- Windows PC, no Mac, no build tools
