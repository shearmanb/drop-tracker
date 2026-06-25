# Bourbon Drop Tracker — Daily Review (2026-06-22)

Scope: full pass over code, infrastructure, design, and backlog. Single-file
app (`index.html`, 5823 lines), GitHub Pages + Google Sheets/Apps Script.
Season status: off-season, no active waves.

Every item is labeled (1a, 1b, …) so you can refer back to it.

---

## 1 — Cleanup / Simplify / Efficiency

### 1a. Collapse the duplicated mobile/desktop map code
- **What:** `renderMarkers()` (mobile, ~2157) and `renderDesktopMarkers()` (~3468) are line-for-line copies except mobile binds a popup and desktop binds a click handler. Same for `buildMap()` / `buildDesktopMap()` (~1868 / ~3452) and `updateSyncBadge()` / `updateDesktopSyncBadge()` (~1336 / ~3442). Factor each pair into one function that takes an `onMarker` callback / element id.
- **Impact:** Touches both map render paths. Needs a careful test of both layouts.
- **Biggest benefit:** Kills the single largest source of the "keep both maps in sync" drift that CLAUDE.md explicitly warns about — one change instead of two.
- **Risk/downside:** A bad refactor breaks both maps at once. Do it behind a manual side-by-side test in Chrome (mobile + `body.desktop`).

### 1b. One `allWaveLabels()` helper for wave-list building
- **What:** The `/^\d{4}/` filter + `[...new Set(...)].sort().reverse()` idiom is repeated in at least 6 places (`renderWaveList` ~1530, `buildWaveSelect` ~2200, `loadFromSheet` ~1792, `loadFromCache` ~1836, ~5226, ~5318).
- **Benefit:** One source of truth for what counts as a valid wave label; fixes the minor bug where new pending-only waves don't appear (the builders read raw `DROPS`, not `allDrops()`).
- **Risk:** Low. Pure consolidation.

### 1c. Build a `STORES` id→object Map once
- **What:** `STORES.find(s=>s.id===…)` runs all over the hot paths — `parseNums` calls it inside a `.map`, `buildDistrictBar` filters `allDrops()` twice per district inside the district loop. ~76 find/filter/querySelector scans.
- **Benefit:** Turns repeated O(n·m) linear scans into O(1) lookups; meaningful on an older iPhone.
- **Risk:** Must rebuild the Map whenever `STORES` reloads from the sheet. Low if wired into `loadFromSheet`/`loadFromCache`.

### 1d. Stop full map teardown on every `refresh()`
- **What:** `refresh()` rebuilds *every* pin (each an `L.divIcon` with innerHTML) on any drop log, wave switch, or color-mode cycle. `_quickMarkCore` even wraps a full `refresh()` in `setTimeout(…,80)` to reflect one pin.
- **Benefit:** Diff/update only changed pins → far less jank when logging drops while hunting.
- **Risk:** More complex than teardown-and-rebuild; introduces marker-lifecycle bookkeeping. Medium effort.

### 1e. Remove dead / vestigial code
- **What:** `updateZoomBadge()` (~1883) just sets opacity 0 ("no longer needed"); same dead badge inline at ~3462. Drop fields parsed but never written or shown: `hellcatNotes`, `truckNotes`, `minutesSinceMidnight`, `dayOfWeek` (parsed ~1698) and `jd14` (~1685, not even in the CLAUDE.md store model).
- **Benefit:** Less to read and mis-maintain.
- **Risk:** Trivial — just confirm nothing references them before deleting.

### 1f. Retire the "core + setTimeout DOM-patch" wrapper pattern
- **What:** `_syncFromSheetCore`, `_quickMarkCore`, `_getDropOrderCore`, `openDistrictPanel`/`_openDistrictPanelCore`, `buildSbDistricts`/`_buildSbDistrictsCore`. Several wrappers run the core, then `setTimeout(…,50)` + `querySelectorAll` to re-find freshly rendered DOM and inject more content.
- **Benefit:** Timing-dependent post-render DOM patching is brittle and slow; building the full markup in one pass is more reliable.
- **Risk:** Medium — these were likely added to work around render ordering, so each needs individual care.

---

## 2 — General Improvements

### 2a. Make it an actual PWA (service worker + manifest)  ⭐ highest-value
- **What:** There is **no service worker and no web manifest** anywhere (verified — zero matches). It's used/marketed as an offline mobile app but is neither installable to the iPhone home screen nor offline-capable. The localStorage "cache" only helps *after* the HTML + Leaflet have already loaded over the network.
- **Upside:** The single biggest real-world win for a "use it while driving/hunting with spotty signal" app — installable, instant cold start, works in a dead zone.
- **Risk:** SW cache versioning/invalidation is the classic footgun (stale app served after deploy). Keep the SW minimal: cache the shell + Leaflet + recent tiles, network-first for the HTML.
- **Why:** Directly serves the core use case the app exists for.

### 2b. Add an `esc()` HTML-escaper and use it on all freeform fields
- **What:** No escaping helper exists. Freeform, externally-sourced fields (bottles, notes, reporter, address, discordLink, wave) are interpolated raw into `innerHTML`, `value="…"`, and `href="…"`. Confirmed: `value="${d?.reporter||''}"` at lines 2546 / 3051 / 3073 — a reporter value containing `"` breaks out of the attribute.
- **Upside:** Closes a latent XSS/injection hole; data flows in from Discord reports via a world-writable sheet (see 4a), so a garbled/malicious `bottles` value could execute.
- **Risk:** Low — additive. Also validate `discordLink` starts with `https://` (a `javascript:` href would execute on click).
- **Why:** Low effort, removes a whole bug class.

### 2c. Harden the network paths
- **What:** `scriptPost` (~2720) does `await r.json()` with no `r.ok` check (Apps Script often returns a 200 HTML error page → throws → silent `false`). `flushPending` awaits writes **sequentially** (N drops = N serial round-trips on flaky cell). No retry/backoff and no periodic flush — a failed flush sits until the user happens to log another drop or relaunches.
- **Upside:** Fewer silent failures; drops actually sync when signal returns.
- **Risk:** Low–medium. Add `r.ok` checks, a bounded retry, and a flush on `online`/visibilitychange events.

### 2d. Wrap localStorage writes in try/catch for quota
- **What:** `pendingDrops`, `cachedStores`, `cachedDrops`, `cachedBottles` are stringified to localStorage with no guard (~1805–1811, 2740, 2811), while theme/colorMode writes *are* guarded — inconsistent. A `QuotaExceededError` mid-flush throws uncaught.
- **Upside:** Caching/flush never hard-fails as Drops history grows toward the ~5 MB cap.
- **Risk:** Low. (Photos already correctly use IndexedDB blobs, not base64 — that earlier risk is resolved.)

### 2e. Split JS/CSS into separate files (no build step required)
- **What:** ~1300 lines CSS + all HTML + ~4500 lines JS in one file. You can reference `app.js` / `styles.css` from `index.html` and still deploy with a plain `git push` — no bundler.
- **Upside:** Navigable code, smaller merge-conflict surface, mobile/desktop renderers stop living 1300 lines apart (which is what causes the drift in 1a).
- **Risk:** Low. One-time move; keep the no-build deploy flow.

### 2f. Accessibility pass
- **What:** Pervasive `onclick` on non-interactive `<div>`s with no `role`/`tabindex`/keyboard handler; icon-only buttons lack `aria-label`; status is conveyed by color alone (district/tier hues) with no text alternative; log-modal inputs lack `<label for>`.
- **Upside:** Usable with VoiceOver, keyboard, and for color-blind users.
- **Risk:** Low, incremental.

---

## 3 — What I'd Do Differently / Improve Now

### 3a. Treat "both maps in sync" as a structural problem, not a discipline problem
The CLAUDE.md rule "always update BOTH map instances" is a workaround for the duplication in 1a. A rule you have to remember every edit is a latent bug. **Improve now:** do 1a so the invariant is enforced by structure, then soften the rule.

### 3b. Invest in the PWA shell before more features
Most completed work is features (pickers, queues, analytics) on top of an app that can't actually run offline (2a) — the one thing a hunting-in-the-field app most needs. **Improve now:** prioritize 2a/2c/2d over new feature work for the next session.

### 3c. The manual cache-invalidation contract is error-prone
`invalidateDropCache()` must be called by hand after every drop/wave mutation. **Improve now (cheap):** centralize mutations behind a couple of setter helpers (`addPendingDrop()`, `setWave()`) that always invalidate + persist, instead of the current copy-pasted trio at each call site.

### 3d. Pin the third-party CDN dependencies
Leaflet loads from a CDN with (per review) no SRI/version pin verified. **Improve now:** pin exact versions + add Subresource Integrity hashes so a CDN change can't break or compromise the app.

---

## 4 — Biggest Risk / Most Fragile

### 4a. The Apps Script endpoint is effectively world-writable  ⚠️ #1
`SCRIPT_TOKEN = 'PkuEzRzlltYwajakc2a0PThQIo2Nw8Ky'` (line 2717) and `SCRIPT_URL` sit in a public GitHub Pages file *and* in git history (`CONVENTIONS.md` even records the old token `bourbon2026`). The token is sent in the URL query string. Anyone who views source can POST arbitrary rows via `addDrop`. It is **not** a security boundary — treat the sheet as public/untrusted input, which is exactly why 2b matters. Realistic worst case: someone scribbles junk or HTML into your Drops sheet. Mitigations are limited without a real backend, but at minimum: rotate the token periodically, keep server-side validation strict, and escape on render (2b).

### 4b. Data-loss window on `pendingDrops`
Quick-logged drops live **only** in localStorage until a successful flush. There's no retry timer and no flush-on-reconnect (2c). If Safari evicts site data (iOS clears unused PWA storage after ~7 days), or the user clears data, before a flush succeeds, those drops are **gone** — they were never on the sheet. This is the most likely way you silently lose real hunting data. Fixing 2c + a visible "X pending" badge (already in TODO as IDLE-4) closes it.

### 4c. Shared-`currentPinStage` stale render when both maps exist
If the layout is toggled at runtime so both maps are live, zooming one map mutates the shared `currentPinStage`, so the other map's `if(st!==currentPinStage)` guard sees no change and skips its re-render — stale pin detail until you independently zoom it. Latent today (one map usually active); 1a removes it.

### 4d. Apps Script "redeploy as New Version" foot-gun
Per CLAUDE.md, write actions only take effect if redeployed as a *new* version. Several backlog items (F11 persistence, addBottle/updateBottle, BottleDrops) depend on this manual step. Easy to "fix" the script and see nothing change. Document a redeploy checklist.

---

## 5 — Pending Features & To-Do (not yet implemented)

### 🔴 High priority
- **BOTTLE-RESYNC** — locally-added/edited bottles created before the May 18 Apps Script fix were never synced; re-save each `local`/`edited` bottle.
- **F11 persistence** — bottle-status (confirmed/absent/rumored) picker UI done; needs BottleDrops sheet tab + `addBottleDrop` Apps Script action.
- **VABC-1** — run `testVABCFetch()` in Apps Script to see if `UrlFetchApp` can reach abc.virginia.gov (200 vs 403); gates VABC-2.
- **BTL-SCRIPT** — add `addBottle` / `updateBottle` Apps Script actions (bottle edits are local-only until then).
- **SHEET-FIX** — split Blood Oath / Bomberger's collision (Bottles row 42, code `BO12`).
- Test passes: bottle picker (both panels), issues queue write-back, Quick Drop end-to-end, verify v0.4 loads with no console errors.

### 🟡 Data cleanup
- Normalize ReportedTS timestamps (778 rows, inconsistent formats).
- Rename old wave labels → `YYYY.MM.DD-DXX-bottles`.
- Audit drops with no wave label.
- Resolve all OF1924 collisions (HH vs Brown-Forman) via Issues queue; needs sheet write-back (B1).
- Audit remaining bottle codes for other collisions / wrong assignments.

### 📱 Mobile features
- **IDLE-1** Fill-in UX rework (skip-for-now vs skip-forever; faster picker; 10 drops in <2 min).
- **IDLE-2** Quick Drop → fast inline bottle entry (no full modal).
- **IDLE-3** On-the-fly wave switching with visible current-wave indicator on the map.
- **IDLE-4** Offline resilience review + visible "X pending" badge (ties to 4b).
- Hunt-mode improvements (auto-refresh list, "heading there" → nav + mark in-progress, sell-out estimate).
- Push notifications during active drop windows based on district patterns.

### 🖥️ Desktop features
- **DT-1** Top nav bar. **DT-2** Desktop→mobile toggle. **DT-3** District label prominence + larger panel font. **DT-4** Wave-scoped action buttons on store panel.
- **F7** Edit/delete drops, bulk wave-label assignment (syncs to sheet).
- **BTL-2** Bottle edit UI (name/shortcode/tier/collision/deprecate).
- Add/edit stores in-app. **F16** One-click CSV export/backup.

### 🔁 Both
- **VABC-2** VABC metadata enrichment (proof/price/size, link chips to product pages) — blocked on VABC-1.
- **BTL-1** Bottle browser/search ("which stores had Eagle Rare this wave?").
- Waves management screen + wave creation dialog.
- Store notes (per-store, to Stores `notes` column).
- Polling sync (auto-detect sheet changes every ~5 min).
- Consolidate review queues (F4 / F9 / F10 / Issues) into one triage hub.
- **F3** Deep district pattern analysis (heatmaps, day-of-week, predictive next-wave).
- **F8** Pattern wave drop-list polish. **F15** Cycle coverage alerts ("D14 80% done").
- **F17** Two-way Sheets sync. Store leaderboard. Cycle timeline. Store visit log. "Due for a drop" S-tier alerts.

### ❓ Unscoped
- General bottle-tracking concept (spec TBD). Bulk import from Excel/CSV (mobile/desktop/backend unclear).

---

### Suggested next-session order
1. **2a** service worker + manifest (offline shell) and **2c/2d/4b** flush hardening — the field-reliability core.
2. **2b** `esc()` escaper — cheap, removes the injection class.
3. **1a** factor the duplicated map code — pays down the biggest structural debt and fixes 4c.
4. Then resume feature work (IDLE-* for active season, F11 persistence).
