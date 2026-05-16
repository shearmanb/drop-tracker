# Bourbon Drop Tracker — Data Model

## Google Sheet Tabs

### Stores tab
| Column | Type | Notes |
|---|---|---|
| id | number | 2-3 digit store number — PRIMARY KEY |
| label | string | City/location name e.g. "McLean" |
| district | string | "D14" format — always capital D + number |
| address | string | Full street address |
| qRank | decimal | Quality rank 1-3 scale |
| tier | string | S/A/B/C — auto-calculated from qRank |
| sRank | number | Sales rank within district (1 = highest) |
| sRankLabel | string | "3 / 17" format |
| hh22 | boolean | Got Heaven Hill 22 — TRUE/FALSE |
| bb30 | boolean | Got Blade and Bow 30 — TRUE/FALSE |
| jd14 | boolean | JD14 flag — TRUE/FALSE |
| lat | decimal | Latitude |
| lng | decimal | Longitude |

### Drops tab
| Column | Type | Notes |
|---|---|---|
| wave | string | "YYYY.MM.DD - Description" format |
| storeId | number | References Stores.id |
| district | string | "D14" format |
| result | string | "drop" / "no_drop" / "unknown" |
| timestamp | string | ISO format "YYYY-MM-DDTHH:MM" EST |
| reporter | string | Discord username |
| bottles | string | Freeform for now — see F11 for normalization |
| notes | string | Freeform notes |
| discordLink | string | URL to Discord thread |
| dropQuality | number | 1-3 scale |
| topBottle | boolean | Was top bottle of cycle here |
| minutesSinceMidnight | number | Auto-calculated from timestamp |
| dayOfWeek | number | 1=Sunday, 7=Saturday — auto-calculated |
| hellcatNotes | string | Notes from HC (top hunter) |
| truckNotes | string | Truck delivery notes |
| needsReview | boolean | TRUE = flagged, needs data cleanup |

### Waves tab
| Column | Type | Notes |
|---|---|---|
| wave | string | Wave label |
| created | string | ISO timestamp when wave was created in app |

### Patterns tab
| Column | Type | Notes |
|---|---|---|
| wave | string | Wave label |
| district | string | "D14" format |
| mode | string | See mode list below |
| start | string | When district started dropping |
| clusterA | string | First cluster timestamp |
| clusterB | string | Second cluster timestamp (or blank/None) |
| details | string | Human readable description |
| special | string | Holiday / Statewide Drop / Outlier / Abnormal |
| notes | string | Anything else |

---

## Key Values & Enums

### Drop result values
- `drop` = confirmed drop happened
- `no_drop` = confirmed nothing was released
- `unknown` / blank = no data for this store this cycle

### District format
Always `D14` — capital D + number. NEVER just `14`.

### District colors (CSS hex)
- D14: `#f59e0b` amber — home district, highest priority
- D17: `#2563eb` cobalt blue
- D18: `#10b981` emerald green
- D07: `#ef4444` red
- D20: `#06b6d4` teal
- D16: `#64748b` slate
- D12: `#475569` dark slate

### District z-index (pin layering — D14 on top)
D14: 700, D17: 600, D18: 500, D07: 400, D20: 300, D16: 200, D12: 100

### Wave label format
`YYYY.MM.DD - Description` e.g. `2026.04.27 - MM BO EHT`
- Waves are PER DISTRICT — different districts can share same wave name
- Older unlabeled waves exist in data — needsReview=true

### Pattern modes (dropdown list)
1. Simultaneous Cluster
2. Two Cluster (Same Day)
3. Two Cluster (Two Day)
4. Same Day Rolling Window
5. Two at a Time (Random)
6. 4+ Cluster / Abnormal
7. No Pattern

### Tier mapping from qRank (1-3 scale)
- S tier: 2.5–3.0 (displayed as 8.3–10 on /10 scale)
- A tier: 2.0–2.49
- B tier: 1.3–1.99
- C tier: 0–1.29

---

## Bottle Shortcode Reference (key ones)

| Code | Full Name | Brand | Notes |
|---|---|---|---|
| ER | Eagle Rare 10yr | Buffalo Trace | NOT 17yr — only 10yr at VA ABC |
| RR | Russell's Reserve SiB | Wild Turkey | NOT Rabbit Hole |
| RR13 | Russell's Reserve 13yr | Wild Turkey | Different from RR |
| RR15 | Russell's Reserve 15yr | Wild Turkey | Different from RR |
| ETL | Elmer T. Lee | Buffalo Trace | BT product, NOT Heaven Hill |
| EHT / EHTsm | EH Taylor Small Batch | Buffalo Trace | Most common EHT |
| EHTsi | EH Taylor Single Barrel | Buffalo Trace | |
| EHT BP | EH Taylor Barrel Proof | Buffalo Trace | |
| CC / EHT CC | EH Taylor Warehouse C | Buffalo Trace | Very rare |
| Stagg / GTS | George T. Stagg | Buffalo Trace | BTAC annual |
| WLW / WSib | William Larue Weller | Buffalo Trace | BTAC — Sib = Sibling release |
| OWA | Old Weller Antique 107 | Buffalo Trace | |
| CYBP | Weller Craft Your Path | Buffalo Trace | |
| Blantons | Blanton's Original | Buffalo Trace | Default Blanton's |
| Bgold / BG | Blanton's Gold | Buffalo Trace | |
| BSFB / BO | Blanton's Straight From Barrel | Buffalo Trace | Japanese market |
| HH22 | Heaven Hill 22yr | Heaven Hill | Most sought after |
| HH90 | Heaven Hill 90th Anniversary | Heaven Hill | |
| OF11 | Old Fitzgerald 11yr BiB | Heaven Hill | |
| OF1924 | ⚠️ FLAGGED COLLISION | — | Could be OFitz 1924 (HH) OR Old Forester 1924 (BF) |
| ECBP | Elijah Craig Barrel Proof | Heaven Hill | |
| EC15 | Elijah Craig 15yr | Heaven Hill | |
| ECT / eC | Elijah Craig Toasted | Heaven Hill | |
| MTBF / MTB | Michter's Toasted Barrel | Michter's | NOT Penelope |
| PTB / PenToast | Penelope Toasted | Penelope | Different from MTBF |
| Pomega | Penelope Omega | Penelope | Was entered as "Pomega" in data |
| Rio | Penelope Rio | Penelope | Short for Penelope Rio |
| Penelope 13 | Penelope 13yr | Penelope | Different bottle from Rio |
| 4R LE | Four Roses Limited Edition SB | Four Roses | Annual release |
| M10 / M10r | Michter's 10yr | Michter's | |
| MMCA | Michter's Celebration | Michter's | Ultra rare |
| OFBB | Old Forester Birthday Bourbon | Old Forester | Annual Sept |
| BDS | Bardstown Discovery Series | Bardstown | Numbered series |
| WT KC12 | Wild Turkey Master's Keep | Wild Turkey | |
| WSIB | Wild Turkey / Russell's Reserve SiB | Wild Turkey | |
| Cal18 | Calumet Farm 18yr | Calumet | |

---

## Apps Script Actions

| Action | Method | Description |
|---|---|---|
| getStores | GET | Returns all rows from Stores tab |
| getDrops | GET | Returns all rows from Drops tab |
| getWaves | GET | Returns all rows from Waves tab |
| getPatterns | GET | Returns all rows from Patterns tab |
| addDrop | POST | Appends one row to Drops tab |
| addWave | POST | Appends one row to Waves tab |
| bulkWriteStores | POST | Clears and rewrites entire Stores tab |
| bulkWriteDrops | POST | Clears and rewrites entire Drops tab |
| bulkWriteWaves | POST | Clears and rewrites entire Waves tab |

---

## App Architecture Notes

### Two map instances
- `map` = mobile Leaflet map
- `desktopMap` = desktop Leaflet map
- Always update BOTH when changing markers or status

### localStorage keys
- `cachedStores` = JSON array of stores
- `cachedDrops` = JSON array of drops
- `cachedPatterns` = JSON array of patterns
- `cacheTime` = timestamp of last sheet sync
- `pendingDrops` = quick-logged drops not yet synced to sheet
- `forceLayout` = "desktop" or "mobile" override

### Critical coding rules
- NEVER use const to override/wrap existing functions — causes hoisting errors
- Always call initAndDetect() at the very bottom of script after ALL functions
- Desktop layout activated by adding body.desktop CSS class
- When updating Apps Script, ALWAYS redeploy as New Version
- Test in Chrome F12 console before declaring done

### Store 267
User's closest store — McLean area. Used as home reference point for distance calculations when distMode = 'home'.

### Distance calculation
Simple straight-line × 1.5 suburban factor ÷ 35mph = estimated drive time in minutes. Not GPS routing — good enough for triage.
