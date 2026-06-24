# Drop Pipeline — CLAUDE.md  (lives in `pipeline/` inside the drop-tracker repo)

## What this is
A personal pipeline that captures Virginia ABC allocated-bourbon "drop" reports from a NoVA Discord,
parses the messy human text into structured data, and writes it to a **new, separate Google Sheet**
used for drop-pattern prediction. **Producer side only** — the Drop Tracker PWA (`../index.html`) is
the *consumer*. They integrate via data (the Sheet + the Cellar API), never via shared code.

> This folder is self-contained. The Drop Tracker app (`../index.html`) is **never modified** by
> pipeline work. If the pipeline ever outgrows the subfolder, the whole `pipeline/` directory can be
> lifted into its own repo unchanged.

## Owner / constraints
- Non-developer "vibe coder." Windows, **no terminal**. Deploys by pasting into the GitHub browser
  editor and the Apps Script editor. Wants the *why* in plain English; validates by outcome.

## Architecture (loosely coupled via DATA)
- **Capture:** two browser **bookmarklets** read the *rendered* Discord DOM on a manual click and
  POST raw text. No Discord API, no user token — deliberately out of self-bot territory.
- **Backend:** **Google Sheets + Apps Script.** On the hot capture path Apps Script is a **DUMB
  PIPE** — `doPost` appends rows and nothing else (keeps redeploys near-zero). The review app's
  reads/writes and the Cellar lookups go through `doGet` (whose responses are readable cross-origin).
- **Bottle identity:** the **Cellar app is the single source of truth.** Store only `cellar_id`.
  Resolve raw tokens → ids via Cellar `/api/match`, proxied through Apps Script. No local bottle list.
- **Parsing:** **artifact-first** — a Claude.ai artifact (keyless) handles messy *thread* extraction
  while logic is volatile; the *channel* is parsed by deterministic rules in the app. Move the model
  call into Apps Script later when automating.

## Core principles
1. **Collect raw, parse later.** Raw capture is append-only; parsing is a separate, re-runnable pass.
2. **Per-message rows, never blobs** (sidesteps the cell-size limit; enables dedup on the Discord
   message id, stored as `raw_id`).
3. **`cellar_id` is the only bottle data anything stores.**
4. **Dumb pipe on capture:** `doPost` appends; all volatile logic lives in the app / artifact.
5. **Suggest, don't auto-decide** on judgment calls (waves, quality, unknown terms): propose into a
   review queue, human confirms, confirmed records **lock** (the suggester only proposes for
   unconfirmed/unassigned items).

## Resolved decisions (concrete, as built)
- **Location:** `pipeline/` subfolder of `drop-tracker` (chosen over a separate repo for simplicity;
  app code untouched). Served on GitHub Pages at `…github.io/drop-tracker/pipeline/`.
- **Backend Sheet:** a NEW sheet imported from the provided `drop-pipeline-backend.xlsx`. The Apps
  Script is **container-bound** to it (`getActiveSpreadsheet()` → no Sheet ID in code).
- **Cellar base URL:** `https://cellar-production-1ba7.up.railway.app` (proxied via Apps Script
  `?action=resolve` and `?action=bottles`).
- **CORS:** bookmarklet captures use `doPost` + `text/plain` in `mode:'no-cors'` (fire-and-forget;
  idempotent via `raw_id`). The app uses `doGet` GET-with-`data` for reads/writes (readable response).
- **Token:** optional `PIPELINE_TOKEN` in Apps Script *Script Properties*; auth is skipped until set.
- **`dropId`** join key = `Store # + "_" + ReportedTS` (wave-independent, since waves are assigned later).

## Files in this folder
- `appsscript/Code.gs` — the catcher (`doPost` append) + `doGet` (getTab / write / resolve / bottles)
  + editor test functions. **The keystone.**
- `bookmarklets/firehose.js` — channel → `raw_channel` (incl. nadas). `bookmarklets/thread.js` —
  one thread → `raw_threads`.
- `install.html` — fills your URL/token into the bookmarklets and makes them draggable.
- `index.html` — Worklist + Review app (dashboard, thread intake, wave suggest/confirm, lexicon
  review, needs-review, channel parser, derived fields). Single file, Pages-hosted.
- `artifact-prompt.md` — the thread-parser prompt + the JSON contract `index.html` consumes.
- `README.md` — setup order for the owner.

## Data model — the new Sheet's 8 tabs
- `raw_channel`, `raw_threads` — append-only, per-message capture (`raw_id` = Discord message id).
  `raw_channel` also has `msg_link` — the captured per-message Discord deep link
  (`/channels/<guild>/<channel>/<raw_id>`). The channel parser converts a `!drop` row's link
  into a **thread** link (`/channels/<guild>/<raw_id>`, since a thread's id == its starter
  message id) and writes it to `Drops.'Link to report'`. **A `msg_link` header must exist on the
  `raw_channel` tab** — writes only fill columns that already exist, so without it the link is dropped.
- `checks` — parsed sightings (drop / leftover / nada) from the channel; revives nada "bracketing".
- `Drops` — event table; `dropId` join key; `dropQuality` (overall) + `dropQualityDepth`
  (count/distribution of good bottles) side by side; `topBottle` is wave-relative.
- `drop_bottles` — one row per bottle per drop; carries `dropId` + `cellar_id` (+ `raw_text`,`status`).
- `lexicon` — **non-bottle terms only** (sentiment / negative-cue / status-cue / joke / noise).
- `Stores` — store→district map (reference). `Waves` — wave list + status.

## Discord parsing notes
- Channel: `!drop <store#> <comments>` creates a thread. Negatives (`Nada <store>`) stay in the
  channel feed — the firehose captures them. "Average Joe's Bot" / "please consolidate" → exclude.
- Thread root author = reporter; root timestamp = report time. Bottles accrete across messages/days;
  "those are leftovers"/"was there yesterday" → leftover; "last X gone" → gone.
- Exclude jokes ("allocated phone/tears"), buy requests ("ill take one"); "sadness"/"not much" =
  sentiment, NOT bottles.
- `hellcatNotes` = messages from username `hellcat_rulz` (display "hellcat").

## Wave assignment (nuance)
A wave = **characteristic bottle set + approximate window**, NOT a date cutoff. Never assign by
"next available drop" — a store can skip a cycle. The app clusters unassigned drops by
bottle-signature overlap + date proximity and proposes; the owner confirms/splits/merges/reassigns;
confirmed waves lock. `topBottle` = the wave's #1 bottle (highest tier, then most frequent).

## Cellar API contract (frozen/versioned)
- `GET /api/bottles` — canonical JSON, no auth. Link on `id` (immutable). `shortcodes` = match key.
- `GET /api/match?q=EHT,GTS` → `{matched, unmatched}`. `?archived=1` includes archived. Don't use
  `/api/export` (lossy). All Cellar calls are proxied through Apps Script to dodge browser CORS.

## Deploy notes
- Apps Script: while iterating, use the **/dev** (head) URL so saved code runs without a new
  deployment; switch to **/exec** when stable. Bookmarklets are saved as browser bookmarks; the HTML
  apps deploy via the GitHub browser editor to Pages.
