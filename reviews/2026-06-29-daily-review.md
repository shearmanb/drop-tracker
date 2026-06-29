# Bourbon Drop Tracker — Daily Review (2026-06-29)

Scope: full pass over code, infrastructure, design, and backlog. Two apps now:
the Drop Tracker PWA (`index.html`, 5,864 lines) and the **new Drop Pipeline**
(`pipeline/`, ~1,862 lines of code + docs) that captures Discord reports.
GitHub Pages + Google Sheets/Apps Script. Season status: off-season.

Every item is labeled (1a, 1b, …) so you can refer back to it.

> **Delta note:** All of last week's findings (2026-06-22: 1a–4d) on the main app
> are **still open and unchanged** — verified: still no service worker/manifest,
> still no `esc()` in `index.html`, token still in source, still no `r.ok` checks.
> The entire week's work went into the new `pipeline/` subsystem. So this review
> re-confirms those (condensed in §6) and focuses fresh attention on the pipeline.

---

## 1 — Cleanup / Simplify / Efficiency

### 1a. Two apps are re-deriving the same helpers — extract a tiny shared `lib.js`
- **What:** The pipeline app re-implements logic the main app already has: an EST
  timestamp canonicalizer (`canonTS`/`estParts`, pipeline ~349), store id→object
  lookups (`storeDistrict`/`storeLabel`/`knownStore`, ~340), the `?action=…&token=`
  GET helper (`api`, ~244), and an `esc()` escaper (~237). Both also hardcode the
  same Apps Script GET-with-data pattern.
- **Impact:** Touches both apps' network + date code. The two backends are
  *different sheets*, so only the pure helpers move, not config.
- **Biggest benefit:** One correct EST/timestamp implementation instead of two that
  can drift (timestamp join keys are load-bearing for `dropId` — a divergence here
  silently breaks drop↔thread joins).
- **Risk/downside:** The pipeline CLAUDE.md deliberately keeps the two apps
  *decoupled* ("they meet at the data, never in shared code"). A shared file
  re-couples them. Keep it to pure, dependency-free utilities only, or skip it and
  just keep the two `canonTS` implementations byte-identical by policy.

### 1b. `esc()` already exists in the pipeline app — backport it to the main app
- **What:** The pipeline app got this right: `esc()` at `pipeline/index.html:237`
  and it's applied consistently across all ~20 `innerHTML` sites (channel preview,
  worklist reporter, review queues, thread bottle lists — spot-checked, all wrapped).
  The main app still has **zero** escaping (last week's 2b).
- **Benefit:** The harder design work is done; copy the one-liner and its usage
  pattern into `index.html`. Removes the whole injection class in both apps.
- **Risk:** Low. Additive.

### 1c. `api()` and `scriptPost()` should share one hardened fetch wrapper
- **What:** `pipeline/index.html:246` does `fetch(...).then(r=>r.json())` with **no
  `r.ok` check** — identical to the main app's `scriptPost` gap (last week's 2c).
  Apps Script returns a 200 HTML error/login page on many failures, so `r.json()`
  throws and surfaces as a generic "no connection."
- **Benefit:** Both apps stop mis-reporting server errors as network errors.
- **Risk:** Low.

### 1d. (Carried) Main-app structural cleanups still stand
- 1a/1b/1e/1f from last week (duplicated mobile/desktop map render code,
  `allWaveLabels()` helper, `STORES` id→Map, dead `updateZoomBadge`/unused drop
  fields, the `_core`+`setTimeout` DOM-patch wrappers) are all unchanged. See §6.

---

## 2 — General Improvements

### 2a. Decouple from the Cellar app, or give bottle resolution a fallback  ⭐ pipeline's #1 dependency risk
- **What:** Bottle identity is *entirely* delegated to an external service —
  `cellar-production-1ba7.up.railway.app` — proxied through Apps Script
  (`Code.gs` `resolve`/`bottles`). By design there is **no local bottle list**
  ("`cellar_id` is the only bottle data anything stores"). Railway free/hobby
  dynos sleep when idle and the subdomain can change on redeploy.
- **Upside:** Cache the `/api/bottles` response to localStorage (the app already
  caches `dp.bottles`) and fall back to it when the proxy is down, so capture +
  parse keep working when Cellar is asleep. Pin the Cellar base URL in one config
  constant (it already is) and document how to rotate it.
- **Risk:** Low. The cache already exists; this just makes it authoritative when
  the live API is unreachable instead of failing resolution.
- **Why:** It's the single external point of failure that can silently halt the
  whole producer side.

### 2b. The capture bookmarklets are pinned to Discord's private DOM
- **What:** `firehose.js` selects on `li[id^="chat-messages-"]`,
  `[id^="message-content-"]`, `[id^="message-username-"]`, `time[datetime]`,
  `[class*="scroller"]`. These are Discord's internal, unversioned markup. Discord
  ships UI changes frequently; any rename silently yields "no messages found" or,
  worse, partial captures that *look* successful.
- **Upside:** Add a sanity assertion — if a scan collects 0 rows but the channel
  clearly has messages, toast a louder "Discord's layout may have changed — tell
  Claude" (distinct from the empty-channel case), and log the selector that failed.
  Consider capturing a tiny `capture_schema_version` in each row so a future parse
  can tell which selector generation produced it.
- **Risk:** Low; purely defensive.
- **Why:** This is the most likely thing to "just stop working" one day with no code
  change on your side (see 4a).

### 2c. Make the Apps Script token actually required (both backends)
- **What:** `pipeline/appsscript/Code.gs` `tokenOK_()` returns `true` when no token
  is set ("auth disabled while testing"), and the production `Code.gs` still ships
  `TOKEN = 'CHANGE-ME-to-a-random-string'`. Separately, the `getTab` read action
  (`Code.gs:68`) and the `bottles` proxy (`:82`) check **no token at all** — anyone
  with the `/exec` URL can read every tab and use you as an open Cellar proxy. The
  main app's token is hardcoded in public source (last week's 4a).
- **Upside:** Set `PIPELINE_TOKEN` in Script Properties, gate `getTab`/`bottles`
  behind it, and treat both sheets as untrusted input regardless.
- **Risk:** Low stakes (personal bourbon data), but it's free to close.

### 2d. (Carried) PWA shell, network/quota hardening, accessibility
- Last week's 2a (service worker + manifest — **still zero**), 2d (unguarded
  localStorage writes), 2f (a11y) are unchanged. See §6.

---

## 3 — What I'd Do Differently / Improve Now

### 3a. The pipeline made the right call the main app didn't — apply the lesson backward
The pipeline app was built with `esc()`, retry-with-backoff (`postBatch`,
`pipeline/index.html:307`), batch+dedup uploads, and reload-verify of writes. The
main app — the older, more-used one — has none of these. **Improve now:** treat the
pipeline as the reference implementation and backport `esc()` (1b) and the `r.ok`
check (1c) to `index.html`. The good patterns already exist in your own repo.

### 3b. Two apps + two sheets + two tokens is now the real architecture — write it down
There is no longer "the app." A new contributor (or future-you) has to discover that
`pipeline/` is a separate producer on a separate sheet with a separate Apps Script.
The pipeline CLAUDE.md is excellent; **improve now (cheap):** add a 3-line "two-app
map" to the *top-level* CLAUDE.md pointing at it, so the split is obvious from the
front door.

### 3c. "Collect raw, parse later" is the strongest decision here — lean into it
Because raw capture is append-only and parsing is a re-runnable pass, a parser bug is
never data loss — you just re-parse. That's the opposite of the main app's
`pendingDrops` data-loss window (4b below). **Improve now:** make sure every parse
writes a `parsed_version` stamp (it's in the schema) so you can re-run only what a
fixed parser would change.

### 3d. (Carried) Treat "both maps in sync" as structural; pin CDN deps
Last week's 3a (the sync rule is a workaround for duplication) and 3d (no SRI on
Leaflet CDN) are unchanged.

---

## 4 — Biggest Risk / Most Fragile

### 4a. Discord DOM dependence is the pipeline's most fragile point  ⚠️ pipeline #1
The entire capture side rests on scraping Discord's unversioned rendered HTML
(2b). When — not if — Discord reshuffles its markup, capture breaks with no warning
and no code change on your end. Mitigation is detection (2b), and the saving grace is
that capture is recoverable (re-scrape once selectors are fixed) and raw is
append-only (3c). Still the likeliest "it stopped working overnight" failure.

### 4b. External Cellar service is a hard single point of failure ⚠️ pipeline #2
See 2a. No local bottle fallback means an asleep/moved Railway app stops all bottle
resolution. The fix (cache-as-fallback) is small and the cache already exists.

### 4c. (Carried, still #1 overall) Apps Script endpoints are world-writable
Both the main app's token (hardcoded in public source) and the pipeline backend
(token defaults to disabled; `getTab`/`bottles` never check it) mean anyone with the
`/exec` URL can read your tabs and append rows. Realistic worst case is junk/HTML
scribbled into a sheet — which is exactly why `esc()` on render matters (1b).

### 4d. (Carried) `pendingDrops` data-loss window in the main app
Quick-logged drops live only in localStorage until a successful flush, with no retry
timer or flush-on-reconnect. iOS can evict site data after ~7 days. This is still the
most likely way to silently lose *real* hunting data. (Note the contrast: the
pipeline's append-only raw capture has no equivalent loss window — 3c.)

### 4e. (Carried) Apps Script "redeploy as New Version" foot-gun
Unchanged. Pipeline mitigates it well by keeping `doPost` a dumb pipe (rarely needs
redeploy) and using the `/dev` head URL while iterating — a pattern the main app
could adopt.

---

## 5 — Pending Features & To-Do (not yet implemented)

### 🆕 Pipeline (new this week — not in last review)
- **PIPE-1** Validate Light-pass bottle resolution on the **real** drop channel
  (a few recent days first), then month-by-month backfill of the year. *(explicit
  "validate next" in RECAP.md)*
- **PIPE-2 (Task #1)** Capture + cross-reference the **#abc-trucks** truck-delivery
  feed as a drop predictor (trucks lead drops). Firehose already pulls that channel.
- **PIPE-3** Move the thread-parser model call out of the Claude.ai artifact into
  Apps Script when the logic stabilizes (currently artifact-first, keyless).
- **PIPE-4** Marry pipeline data with the main Drop Tracker's historical data
  (deferred — go-forward only for now).
- **PIPE-5** Cellar fallback + Discord-DOM change detection + token enforcement
  (this review's 2a / 2b / 2c).

### 🔴 High priority (main app — carried)
- **BOTTLE-RESYNC** — re-save local/edited bottles created before the May 18 fix.
- **F11 persistence** — picker UI done; needs BottleDrops tab + `addBottleDrop`.
- **VABC-1** — run `testVABCFetch()` to see if Apps Script can reach abc.virginia.gov.
- **BTL-SCRIPT** — add `addBottle`/`updateBottle` Apps Script actions.
- **SHEET-FIX** — split Blood Oath / Bomberger's collision (`BO12`, Bottles row 42).
- Test passes: bottle picker, issues queue write-back, Quick Drop end-to-end, v0.4
  loads clean.

### 🟡 Data cleanup (carried)
- Normalize ReportedTS timestamps (778 rows). Rename old wave labels →
  `YYYY.MM.DD-DXX-bottles`. Audit no-wave drops. Resolve OF1924 collisions. Audit
  bottle codes for other collisions.

### 📱 Mobile (carried)
- **IDLE-1** Fill-in UX rework. **IDLE-2** Quick Drop fast inline bottle entry.
  **IDLE-3** On-the-fly wave switching + current-wave map indicator. **IDLE-4**
  Offline resilience + visible "X pending" badge (ties to 4d). Hunt-mode
  improvements. Push notifications during drop windows.

### 🖥️ Desktop (carried)
- **DT-1** Top nav bar. **DT-2** Desktop→mobile toggle. **DT-3** District label
  prominence. **DT-4** Wave-scoped action buttons. **F7** Edit/delete drops + bulk
  wave assignment. **BTL-2** Bottle edit UI. Add/edit stores in-app. **F16** CSV
  export/backup.

### 🔁 Both (carried)
- **VABC-2** VABC metadata enrichment (blocked on VABC-1). **BTL-1** Bottle
  browser/search. Waves management screen + creation dialog. Store notes. Polling
  sync. Consolidate review queues (F4/F9/F10/Issues). **F3** District pattern
  analysis. **F8** Pattern wave drop-list. **F15** Cycle coverage alerts. **F17**
  Two-way Sheets sync. Store leaderboard. Cycle timeline. "Due for a drop" alerts.

### ❓ Unscoped (carried)
- General bottle-tracking concept. Bulk import from Excel/CSV.

---

## Suggested next-session order
1. **PIPE-1** validate Light-pass on the real channel — the pipeline's whole value is
   unproven until this passes on live data.
2. **2a / 2b** Cellar fallback + Discord-DOM change detection — make the producer
   survive its two external dependencies (4a/4b).
3. **1b / 1c** backport `esc()` and the `r.ok` check to the main app (cheap, the
   pipeline already shows how).
4. **Main-app field-reliability core** (carried): service worker + manifest (2a/§6),
   `pendingDrops` flush hardening (4d). The one thing a hunting-in-the-field app
   most needs is still missing.

---

## 6 — Carried items from 2026-06-22 (condensed; full text in that file)
Still open, unchanged, verified today:
- **1a** Collapse duplicated mobile/desktop map render code (`renderMarkers`/
  `renderDesktopMarkers`, `buildMap`/`buildDesktopMap`, `updateSyncBadge` pair).
- **1b** One `allWaveLabels()` helper (idiom repeated ~6×; fixes pending-only waves).
- **1c** Build a `STORES` id→object Map (kills ~76 linear scans on hot paths).
- **1d** Stop full map teardown on every `refresh()` (diff pins instead).
- **1e** Remove dead code (`updateZoomBadge`, unused `hellcatNotes`/`truckNotes`/
  `minutesSinceMidnight`/`dayOfWeek`/`jd14`).
- **1f** Retire the `_core`+`setTimeout` DOM-patch wrapper pattern.
- **2a** Make it a real PWA — service worker + manifest (still **zero** present).
- **2c/2d** Harden `scriptPost` (`r.ok`, retry, flush-on-reconnect); guard
  localStorage writes for quota.
- **2f** Accessibility pass (roles/tabindex/aria-label/labels).
