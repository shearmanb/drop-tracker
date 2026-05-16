# F11 — Bottle Master List + Picker
## Full Specification & Research

---

## The Problem

Current state: bottles are stored as freeform text in the Drops.bottles column.
Examples of the same bottle entered differently:
- "Rio", "Penelope Rio" = same bottle
- "EHT", "EHTsm", "EHTsmall", "ETHsmall", "EH" = same bottle
- "Blantons", "Blanton", "BLA" = same bottle
- "MTBF" was used for BOTH Michter's Toasted AND Penelope Toasted = collision

This makes pattern analysis, store quality scoring, and bottle history unreliable.

---

## The Solution

### New Google Sheet Tab: Bottles
Headers: id | name | brand | distillery | shortcodes | tier | myTier | vabc_code | notes

### New Google Sheet Tab: BottleDrops
Replaces the freeform bottles column in Drops.
Headers: dropKey | bottleId | status | notes

dropKey = wave + "_" + storeId (composite key linking to a drop)
status = "confirmed" / "absent" / "rumored"

---

## Bottle Master List (69 bottles identified)

### S TIER — Kill for these

| id | Name | Brand | Shortcodes | Notes |
|---|---|---|---|---|
| 1 | George T. Stagg Bourbon | Buffalo Trace | Stagg, GTStag, GTS | BTAC annual fall |
| 2 | William Larue Weller | Buffalo Trace | WLW, WL, WellerSib, WSib | BTAC wheated |
| 3 | Eagle Rare 17 Year | Buffalo Trace | ER17, Eagle Rare 17 | BTAC lottery only |
| 4 | Thomas H. Handy Sazerac Rye | Buffalo Trace | THH, Handy | BTAC rye |
| 5 | Sazerac 18 Year Rye | Buffalo Trace | Saz18, Sazerac 18 | BTAC very rare |
| 6 | Pappy Van Winkle 15yr | Van Winkle | PVW15, Pappy 15 | Lottery |
| 7 | Pappy Van Winkle 20yr | Van Winkle | PVW20, Pappy 20 | Lottery |
| 8 | Pappy Van Winkle 23yr | Van Winkle | PVW23, Pappy 23 | Rarest Pappy |
| 9 | Old Rip Van Winkle 10yr | Van Winkle | ORVW, Pappy 10 | Lottery |
| 10 | Van Winkle Special Reserve 12yr | Van Winkle | VSR12, Pappy 12 | Lottery |
| 11 | Heaven Hill 22 Year | Heaven Hill | HH22, HH 22 | Most sought HH |
| 12 | Old Fitzgerald 1924 | Heaven Hill | OFitz1924 | ⚠️ NOT same as OF1924 code collision |
| 13 | E H Taylor Barrel Proof | Buffalo Trace | EHT BP, EHTBP | |
| 14 | E H Taylor Warehouse C Tornado | Buffalo Trace | CC, EHT CC, EHTCC | Very rare surviving barrels |
| 15 | E H Taylor Bottled in Bond | Buffalo Trace | EHT BiB, EHTBIB | Lottery Jan 2026 |
| 16 | Blanton's Straight From the Barrel | Buffalo Trace | BSFB, BO, Blanton SFTB | Japanese market |
| 17 | Four Roses Limited Edition SB | Four Roses | 4R LE, 4RLESB, FR LE | Annual limited |
| 18 | Michter's 10 Year Bourbon | Michter's | M10, M10r | |
| 19 | Michter's 20 Year Bourbon | Michter's | M20, Mich20 | Lottery Apr 2026 |
| 20 | Michter's Celebration | Michter's | MMCA, MC | Ultra premium |
| 21 | Russell's Reserve 13 Year | Wild Turkey | RR13, RR 13 | |
| 22 | Russell's Reserve 15 Year | Wild Turkey | RR15, RR 15 | |
| 23 | Double Eagle Very Rare | Buffalo Trace | DEVR, Double Eagle | Lottery ~$3000 |
| 24 | Weller Millennium | Buffalo Trace | WM, Weller Mill | Lottery Apr 2026 ~$5000 |
| 25 | Old Forester President's Choice | Old Forester | OFPC, OF Presidents | Lottery Nov 2025 |

### A TIER — Worth a trip

| id | Name | Brand | Shortcodes | Notes |
|---|---|---|---|---|
| 26 | Eagle Rare 10 Year | Buffalo Trace | ER, ER10, Eagle Rare | DEFAULT ER in VA ABC |
| 27 | E H Taylor Small Batch | Buffalo Trace | EHT, EHTsm, EHTsmall, EH | Most common EHT |
| 28 | E H Taylor Rye | Buffalo Trace | EHT Rye, EHTRye | |
| 29 | E H Taylor Single Barrel | Buffalo Trace | EHTsi, EHT SB | |
| 30 | Weller Full Proof | Buffalo Trace | WFP, Wfp, Weller FP | |
| 31 | Weller Single Barrel | Buffalo Trace | WLSB, Weller SiB | |
| 32 | Weller C.Y.P.B. | Buffalo Trace | CYBP, Weller CYBP | Craft Your Path |
| 33 | Blanton's Gold Edition | Buffalo Trace | Bgold, BG, Blanton Gold | |
| 34 | Heaven Hill 90th Anniversary | Heaven Hill | HH90, HH 90 | |
| 35 | Old Fitzgerald 11yr BiB | Heaven Hill | OF11, OFitz11 | Fall release |
| 36 | Elijah Craig Barrel Proof | Heaven Hill | ECBP, EC BP | Batch A/B/C annually |
| 37 | Elijah Craig 15 Year | Heaven Hill | EC15, EC 15 | |
| 38 | Elmer T. Lee Single Barrel | Buffalo Trace | ETL, Elmer T Lee | BT product NOT HH |
| 39 | Old Forester Birthday Bourbon | Old Forester | OFBB, OF BB | Annual Sept |
| 40 | Old Forester 1924 10 Year | Old Forester | OFo1924 | ⚠️ NOT same as OFitz 1924 |
| 41 | Michter's Toasted Barrel | Michter's | MTBF, MTB | NOT Penelope |
| 42 | Bomberger's Declaration | Michter's | BO12, Bombergers | |
| 43 | Penelope Omega | Penelope | Pomega, Penelope Omega | Was entered as "Pomega" |
| 44 | Penelope 13 Year | Penelope | Penelope 13, Pen13 | Different from Rio |
| 45 | Wild Turkey Master's Keep KC12 | Wild Turkey | WT KC12, WTMK, KC12 | |
| 46 | Wild Turkey Russell's Reserve SiB | Wild Turkey | RR, RRSIB, WSIB | NOTE: RR = Russell's Reserve |
| 47 | Four Roses Small Batch Select | Four Roses | FRSBS, 4R SBS | |
| 48 | Bardstown Discovery Series | Bardstown | Bardstown Disco, BDS | Numbered series |
| 49 | Kentucky Owl | Stoli Group | Kentucky Owl, KO | |
| 50 | Calumet Farm 18 Year | Calumet | Cal18, Calumet 18 | Lottery 2025 |
| 51 | Weller Antique BiB | Buffalo Trace | WABIB, Weller BiB | |
| 52 | Abraham Bowman Limited Edition | A. Smith Bowman | ASB, Bowman LE | VA local lottery |
| 53 | Boss Hog / WhistlePig | WhistlePig | WJD, WP, Boss Hog | |

### B TIER — Decent, not urgent

| id | Name | Brand | Shortcodes | Notes |
|---|---|---|---|---|
| 54 | Old Weller Antique 107 | Buffalo Trace | OWA | |
| 55 | Blanton's Original Single Barrel | Buffalo Trace | Blantons, Blanton, BLA | Most common |
| 56 | Elijah Craig Toasted Barrel | Heaven Hill | EC, ECT, eC, ECTR | |
| 57 | Penelope Rio | Penelope | Rio, Penelope Rio | Short = Rio |
| 58 | Penelope Toasted | Penelope | PTB, PenToast | NOT MTBF |
| 59 | Wild Turkey Rare Breed | Wild Turkey | WTRB, WT RB | |
| 60 | 1792 BiB Full Proof | Barton | 1792 BiB FP, 1792FP | |
| 61 | Old Elk 7 Year | Old Elk | OE7, OE 7 | |
| 62 | Rock Hill Farms | Buffalo Trace | RHF | Lottery Feb 2025 |
| 63 | Old Forester 1920 | Old Forester | OF1920 | |
| 64 | Jack Daniel's Tennessee Honey LE | Jack Daniel's | JDTH, JD TH | |
| 65 | Phavana | Phavana | Phavana | Tequila-finished bourbon |
| 66 | Elijah Craig Evan Williams | Heaven Hill | ECEW | |

### C TIER — Low priority

| id | Name | Brand | Shortcodes | Notes |
|---|---|---|---|---|
| 67 | Wild Turkey 8 Year | Wild Turkey | WT8, WT 8 | |
| 68 | Green River | Green River | GTG, GR | |
| 69 | Unidentified / Unknown | — | ? | Use when bottle not in list |

---

## ⚠️ Known Issues & Collisions

1. **OF1924 COLLISION** — In drop data, OF1924 was used for both:
   - Old Fitzgerald 1924 (Heaven Hill) → correct code: OFitz1924
   - Old Forester 1924 10yr (Brown-Forman) → correct code: OFo1924
   All OF1924 entries need manual review (add to F4 Needs Review Queue)

2. **MTBF COLLISION** — Was used for both Michter's Toasted AND Penelope Toasted
   - MTBF = Michter's Toasted Barrel Finish (correct)
   - PTB / PenToast = Penelope Toasted (correct going forward)

3. **RR ambiguity** — RR always means Russell's Reserve, NOT Rabbit Hole

4. **ER ambiguity** — ER always means Eagle Rare 10yr at VA ABC (no 17yr in stores)

5. **EHT ambiguity** — Default EHT = Small Batch. EHTsi = Single Barrel. EHT BP = Barrel Proof

---

## UI Design — Bottle Picker

### In the entry panel (desktop logging):

```
BOTTLES
[ Search bottles... type EHT, Stagg, etc ]

Recently used:
  [EHT ✓] [ER ✓] [HH22 ✓] [Blantons ✓]

Search results appear as you type:
  ┌─────────────────────────────────────┐
  │ [S] George T. Stagg    BT  Stagg   │ ← tap to add
  │ [A] EH Taylor Small    BT  EHT     │
  │ [A] EH Taylor SiBar    BT  EHTsi   │
  └─────────────────────────────────────┘

Added bottles:
  EH Taylor Small Batch  [confirmed ▾]  [✕]
  Eagle Rare 10yr        [confirmed ▾]  [✕]
  Stagg                  [absent    ▾]  [✕]  ← "No Stagg" scenario
```

<<<<<<< HEAD

=======
>>>>>>> origin/main
Status dropdown per bottle: confirmed / absent / rumored

### Quick Drop mode
No bottle picker — defer to queue. 95% of field use case.

### Idle Time filling
Queue shows drops missing bottles. Open one → picker loads with that wave's common bottles pre-suggested based on wave label keywords.

---

## Implementation Steps

1. Create Bottles tab in Google Sheet with headers above
2. Run migration script to populate from master list (similar to stores migration)
3. Update Apps Script to add getBottles and addBottleDrop actions
4. Build bottle picker component for desktop entry panel
5. Build BottleDrops write logic
6. Update store cards to show bottle badges from history
7. Update pattern analysis to show common bottles per district
8. Build idle-time bottle filling queue (part of F10)

---

## Migration Script Needed

Similar to the Colab migration we did for stores/drops.
Will need to:
- Write 69 bottles to Bottles tab
- Parse existing freeform Drops.bottles column
- Match to bottle IDs using shortcode lookup
- Write to BottleDrops tab
- Flag unmatched entries for manual review

This is complex — build the UI first, migration second.
