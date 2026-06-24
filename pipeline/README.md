# Drop Pipeline — Setup (no terminal needed)

A producer that captures Discord drop reports into a **new** Google Sheet for the Drop Tracker to
read. Do these steps in order. Each one is copy-paste; nothing here touches your existing app.

---

## Step 1 — Make the backend Sheet
1. Upload `drop-pipeline-backend.xlsx` to Google Drive.
2. Open it → **File → Save as Google Sheets**. (This new Sheet is separate from your drop-tracker Sheet.)
3. In that Sheet: **Extensions → Apps Script**.

## Step 2 — Paste the catcher
1. In the Apps Script editor, delete the sample code and paste **all** of
   `pipeline/appsscript/Code.gs`. Click **Save**.
2. *(Optional security)* In `setupToken()` change the token string, then **Run → setupToken** once.
   Put the same token into the app (Step 5) and the bookmarklets (Step 4). Skip this to run without a token.
3. **Run → test_doPost** (approve the permission prompt the first time). Check the Sheet — a test row
   should appear in `raw_threads`. Delete that test row afterward. *(This proves it works without
   deploying.)*

## Step 3 — Deploy it as a Web App
1. **Deploy → New deployment → Web app.**
2. Execute as: **Me**. Who has access: **Anyone**.
3. **Deploy**, authorize, and **copy the Web app URL** (ends in `/exec`).
   - While you're still changing `Code.gs`, you can instead use **Deploy → Test deployments** and copy
     the `/dev` URL — saved code runs immediately, no redeploy.

## Step 4 — Install the bookmarklets
1. Open `…github.io/drop-tracker/pipeline/install.html` (after you push this folder to GitHub).
2. Paste your `/exec` URL (and token if you set one) → **Save**.
3. Drag **🔥 Capture Channel** and **🧵 Capture Thread** to your browser's bookmarks bar.

## Step 5 — Open the Worklist app
1. Open `…github.io/drop-tracker/pipeline/index.html`.
2. **Settings →** paste the same `/exec` URL (and token) → **Save** → **Test connection** (expect ✓).
3. **Settings → Refresh Cellar bottle list** (loads tiers for quality scoring).

---

## Daily use
1. **Capture (channel):** in Discord (in a browser), open a geographic channel, scroll through the
   day, click **🔥 Capture Channel**. This logs drops *and* the "nada/dry" negatives.
2. **Capture (threads):** open each drop thread, click **🧵 Capture Thread** to grab the bottle ledger.
3. **Parse:** in the app → **Dashboard → Parse channel**. This turns raw channel messages into
   `checks` (sightings) and a `Drops` index, and fills the **Worklist** (drops still missing a thread).
4. **Thread detail:** paste a thread into the parser artifact (`artifact-prompt.md`) → copy its JSON
   → app **Threads** tab → **Preview → Resolve bottles → Save**.
5. **Waves:** **Waves → Suggest waves** → adjust the label/members → **Confirm** (locks it).
6. **Clean up:** **Lexicon** (classify unknown terms), **Review** (clear flagged drops, fix unmatched
   bottles), then **Dashboard → Recompute derived fields**.

## How the pieces talk
```
Discord (browser)
   │  🔥 firehose / 🧵 thread bookmarklet  (POST, fire-and-forget)
   ▼
Apps Script  doPost → appends to raw_channel / raw_threads   (dumb pipe)
   ▲   doGet → getTab / write / resolve / bottles            (the app uses this)
   │
Worklist app (index.html)  ── parse, suggest, confirm, score ──►  Drops / checks / drop_bottles / Waves
   │                                   ▲
   └── bottle tokens ──► Apps Script ──► Cellar /api/match ──► cellar_id
```

## Notes
- **Drop links are captured during the channel sweep** — the firehose records each message's
  Discord link, and **Parse channel** copies every `!drop`'s link into the drop (shown as the ↗
  Discord arrow in the Drop Tracker). The link lands on the `!drop` message with its thread attached
  right below — one tap into the chain. One-time setup: add a column header named **`msg_link`** to
  the `raw_channel` tab (writes only fill columns that already exist). No need to open threads just
  to grab their links.
- **Re-clicking a bookmarklet never duplicates** — rows dedup on the Discord message id (`raw_id`).
- **Parsing is re-runnable.** Improve a rule, re-parse; confirmed waves stay locked.
- The Apps Script stays a dumb pipe on capture, so you rarely redeploy. Changing the *app* or the
  *bookmarklets* is just a `git push` (Pages redeploys in ~60s) — no Apps Script redeploy.
- Bottle quality (`dropQuality`/`dropQualityDepth`) and `topBottle` need the Cellar bottle cache
  (Settings → Refresh). They're suggestions you can overwrite.
