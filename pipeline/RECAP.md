# Drop Pipeline — Recap & Why

A plain-English record of what this is, what we built, and the reasons behind the
non-obvious decisions — so the next session (or future-you) has the context.

## Why this exists
Logging Virginia ABC bourbon "drop" reports from the NoVA Discord by hand was slow, and the
negatives ("nada"/dry) had stopped being recorded at all. Goal: make capture **easier, quicker,
and capture MORE data** (drops + nadas + truck deliveries), feeding the existing Drop Tracker.

This is the **producer**; the Drop Tracker app is the **consumer**. They meet at the data — a new
Google Sheet + the Cellar bottle API — never in shared code. It lives in `pipeline/` so the stable
Drop Tracker (`../index.html`) is never touched.

## What we built
- **Capture bookmarklets** (read Discord's rendered page, copy to clipboard — **no bot, no API, no
  token**):
  - **🔥 Capture Channel (auto)** — auto-scrolls history with a **stop-at-date** for backfill; dedups
    by Discord message id; gentle, jittered pace.
  - **✋ Capture Channel (manual)** — zero automation: you scroll, each click adds to a running total.
    Maximum account safety.
  - **🧵 Capture Thread** — one drop's bottle ledger; works in Discord's split-screen.
- **Worklist + Review app** (`index.html`, GitHub Pages): paste a capture → **Save** → auto-parse.
  - **Light pass** — bottles pulled straight from the `!drop` line and resolved in Cellar (most drops
    are complete from the channel sweep, no thread needed).
  - **2nd pass** — one-click thread **Auto-parse**; pre-loads bottles already on the drop and only
    **adds** new ones (never clobbers the Light pass).
  - Channel parser (rules), wave suggest/confirm, lexicon + needs-review queues, derived fields.
- **Apps Script catcher** (a "dumb pipe") on a **separate** Google Sheet; Cellar is proxied through it.
- **Backend** = 8-tab sheet: Drops, raw_channel, raw_threads, checks, drop_bottles, lexicon, Stores, Waves.

## Hard-won decisions (the "why" behind the gotchas we hit)
- **Copy to clipboard, don't send from Discord.** Discord's security policy (CSP) blocks its pages
  from contacting outside servers — every direct send failed with "Failed to fetch." So the bookmarklet
  **copies**, and the app (on GitHub Pages, no such restriction) does the saving. This is *also* the
  lowest account-risk path.
- **App ↔ Apps Script over GET, not POST.** Apps Script silently swallows a cross-origin `no-cors`
  POST (nothing runs server-side); a GET with the data in the query string works — and matches the
  pattern the existing Drop Tracker already uses.
- **Apps Script file must be pure ASCII.** Unicode (em-dashes/arrows) in comments made the editor
  throw a misleading "Unexpected template string" on paste.
- **Two-pass bottles.** Light pass (from the `!drop` line) + optional deep pass (from the thread), so
  a normal drop needs no thread and you can enrich later; the merge keeps what's there.
- **Backfill.** Auto-scroll with stop-at-date + dedup; re-runs go deeper; manual mode for max caution.
- **Account safety.** Capture is read-only (no bot/token/API) → daily use is ~zero risk. Only
  aggressive backfill *scrolling* is a (low) consideration: keep chunks small, pause if history stops
  loading. What gets accounts banned — self-bots/token tools, sending, scraping — we deliberately do none of.

## Current state (end of this session)
- **Validated:** connection (Apps Script "Anyone" web app), channel capture incl. a ~5-week backfill
  in one click, parse → drops + checks, thread capture + store-number read, the clipboard flow.
- **Validate next:** the Light-pass bottle resolution on the **real** drop channel (a few recent days
  first), then month-by-month backfill of the year.

## Next / parked
- **Task #1:** capture + cross-reference the **#abc-trucks** truck-delivery feed as a drop predictor
  (trucks lead drops). Firehose already pulls that channel cleanly.
- **Deferred:** marrying this with the existing Drop Tracker historical data — go-forward only for now.

## Where things live
- Apps Script `/exec` URL → app **Settings** + (formerly) the bookmarklets; bottle lookups proxied
  through Apps Script to Cellar (`cellar-production-1ba7.up.railway.app`).
- App: `…github.io/drop-tracker/pipeline/index.html` · Installer: `…/pipeline/install.html`
- Setup steps: `pipeline/README.md` · Architecture/principles: `pipeline/CLAUDE.md`
