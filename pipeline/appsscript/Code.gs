/**
 * Drop Pipeline — Apps Script "dumb pipe" catcher
 * ------------------------------------------------
 * This script is CONTAINER-BOUND to the Drop Pipeline Google Sheet
 * (open the Sheet → Extensions → Apps Script → paste this in).
 * Because it is bound to the Sheet, it uses getActiveSpreadsheet() and
 * needs NO Sheet ID.
 *
 * WHAT IT DOES (and deliberately does NOT do):
 *   - doPost(): the HOT capture path used by the bookmarklets. It ONLY
 *     appends raw, per-message rows to a named tab. No parsing, no logic.
 *     This is the "dumb pipe" — keeping it dumb means you almost never
 *     have to cut a new deployment.
 *   - doGet(): the path used by the review APP. It reads tabs, performs
 *     generic key-based writes (upserts), and proxies bottle lookups to
 *     the Cellar API. (GET responses from Apps Script are readable
 *     cross-origin, so the app can confirm its writes; POST responses are
 *     not — which is why capture is fire-and-forget over doPost.)
 *
 * SETUP (one time):
 *   1. Paste this whole file into the Apps Script editor and Save.
 *   2. Run setupToken() once (edit the token first) — or leave the token
 *      unset to disable auth while you test.
 *   3. Run test_doPost() — it appends a test row to raw_threads so you can
 *      confirm it works WITHOUT cutting a deployment. Delete the test row after.
 *   4. Deploy → New deployment → Web app → Execute as: Me,
 *      Who has access: Anyone. Copy the /exec URL into the app + bookmarklets.
 *      (While iterating you can use the test "/dev" URL instead.)
 */

// ===== CONFIG =====
var CELLAR_BASE = 'https://cellar-production-1ba7.up.railway.app';

// Raw-capture tabs get automatic dedup on this column (Discord message id).
var DEDUP_COLUMN = 'raw_id';
var RAW_TABS = ['raw_channel', 'raw_threads'];


// ============================================================
// ENTRY POINTS
// ============================================================

/** Capture path — bookmarklets POST raw rows here. Append-only. */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (!tokenOK_(body.token)) return json_({ success: false, error: 'bad token' });
    if (!body.tab || !body.rows) return json_({ success: false, error: 'missing tab or rows' });

    var sheet = getSheetOrThrow_(body.tab);
    var dedupKey = RAW_TABS.indexOf(body.tab) !== -1 ? DEDUP_COLUMN : (body.dedupKey || null);
    var res = appendObjects_(sheet, body.rows, dedupKey);
    return json_({ success: true, tab: body.tab, appended: res.appended, skipped: res.skipped });
  } catch (err) {
    return json_({ success: false, error: String(err) });
  }
}

/** App path — read tabs, write/upsert rows, resolve bottle tokens via Cellar. */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var action = p.action || 'ping';
  try {
    if (action === 'ping') {
      return json_({ ok: true, ts: new Date().toISOString(), authRequired: !!storedToken_() });
    }

    if (action === 'getTab') {
      var sheet = getSheetOrThrow_(p.tab);
      return json_({ success: true, tab: p.tab, rows: readTab_(sheet).rows });
    }

    if (action === 'resolve') {
      if (!tokenOK_(p.token)) return json_({ success: false, error: 'bad token' });
      var url = CELLAR_BASE + '/api/match?q=' + encodeURIComponent(p.q || '');
      var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      // Pass Cellar's JSON straight through.
      return ContentService.createTextOutput(resp.getContentText())
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'bottles') {
      // Proxy the full Cellar bottle list (for tiers / quality scoring). Cached client-side.
      var burl = CELLAR_BASE + '/api/bottles' + (p.archived ? '?archived=1' : '');
      var bresp = UrlFetchApp.fetch(burl, { muteHttpExceptions: true });
      return ContentService.createTextOutput(bresp.getContentText())
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'write') {
      if (!tokenOK_(p.token)) return json_({ success: false, error: 'bad token' });
      var sheet2 = getSheetOrThrow_(p.tab);
      var objs = JSON.parse(p.data || '[]');
      var res = p.key ? upsertObjects_(sheet2, p.key, objs) : appendObjects_(sheet2, objs, null);
      return json_({ success: true, tab: p.tab, updated: res.updated || 0, appended: res.appended || 0 });
    }

    return json_({ success: false, error: 'unknown action: ' + action });
  } catch (err) {
    return json_({ success: false, error: String(err) });
  }
}


// ============================================================
// CORE HELPERS (generic data ops — no domain logic lives here)
// ============================================================

function getSheetOrThrow_(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Tab not found: ' + name);
  return sh;
}

/** Read a tab into {headers, rows} where each row is an object keyed by header. */
function readTab_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length === 0) return { headers: [], rows: [] };
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    var blank = true;
    for (var c = 0; c < headers.length; c++) {
      obj[headers[c]] = values[i][c];
      if (values[i][c] !== '' && values[i][c] !== null) blank = false;
    }
    if (!blank) rows.push(obj);
  }
  return { headers: headers, rows: rows };
}

/** Append objects as rows (mapping object keys -> header columns). Optional dedup. */
function appendObjects_(sheet, objs, dedupKey) {
  var info = readTab_(sheet);
  var headers = info.headers;
  var seen = {};
  if (dedupKey && headers.indexOf(dedupKey) !== -1) {
    info.rows.forEach(function (r) { if (r[dedupKey] !== '' && r[dedupKey] != null) seen[String(r[dedupKey])] = true; });
  }
  var toAppend = [];
  var skipped = 0;
  objs.forEach(function (o) {
    if (dedupKey && o[dedupKey] != null && o[dedupKey] !== '' && seen[String(o[dedupKey])]) { skipped++; return; }
    toAppend.push(headers.map(function (h) { return (h in o && o[h] != null) ? o[h] : ''; }));
    if (dedupKey && o[dedupKey] != null && o[dedupKey] !== '') seen[String(o[dedupKey])] = true; // de-dupe within the batch too
  });
  if (toAppend.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, toAppend.length, headers.length).setValues(toAppend);
  }
  return { appended: toAppend.length, skipped: skipped };
}

/** Update rows matched on keyCol (merging only provided columns), else append. */
function upsertObjects_(sheet, keyCol, objs) {
  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var keyIdx = headers.indexOf(keyCol);
  if (keyIdx === -1) throw new Error('Key column not found: ' + keyCol);

  var keyToRow = {}; // keyValue -> 1-based sheet row number
  for (var i = 1; i < values.length; i++) {
    var kv = values[i][keyIdx];
    if (kv !== '' && kv != null) keyToRow[String(kv)] = i + 1;
  }

  var updated = 0, appended = 0, appendBuf = [];
  objs.forEach(function (o) {
    var kv = String(o[keyCol]);
    if (kv in keyToRow && keyToRow[kv] > 0) {
      var rowNum = keyToRow[kv];
      headers.forEach(function (h, c) { if (h in o) sheet.getRange(rowNum, c + 1).setValue(o[h]); });
      updated++;
    } else {
      appendBuf.push(headers.map(function (h) { return (h in o && o[h] != null) ? o[h] : ''; }));
      keyToRow[kv] = -1; // avoid duplicate appends within the same batch
      appended++;
    }
  });
  if (appendBuf.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, appendBuf.length, headers.length).setValues(appendBuf);
  }
  return { updated: updated, appended: appended };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// AUTH (optional — disabled until you set a token)
// ============================================================

function storedToken_() {
  return PropertiesService.getScriptProperties().getProperty('PIPELINE_TOKEN');
}

function tokenOK_(token) {
  var stored = storedToken_();
  if (!stored) return true; // no token set => auth disabled (fine while testing)
  return token === stored;
}

/** Run once to set the shared token. Edit the value first. */
function setupToken() {
  var TOKEN = 'CHANGE-ME-to-a-random-string'; // <-- edit me, then Run, then you may blank it out again
  PropertiesService.getScriptProperties().setProperty('PIPELINE_TOKEN', TOKEN);
  Logger.log('PIPELINE_TOKEN set. Put this SAME value in pipeline/index.html (Settings) and in the bookmarklets.');
}


// ============================================================
// EDITOR TESTS (run these on Save — no deployment needed)
// ============================================================

/** Appends a real test row to raw_threads so you can confirm the pipe works. */
function test_doPost() {
  var fakeE = { postData: { contents: JSON.stringify({
    token: storedToken_() || '',
    tab: 'raw_threads',
    rows: [{
      captured_at: new Date().toISOString(),
      thread_title: 'TEST 267 EHT BO',
      store_guess: 267,
      msg_author: 'tester',
      msg_ts: '2026-06-22T10:00',
      msg_text: 'got EHT and Blantons, last bottle gone',
      raw_id: 'test-' + Date.now(),
      parsed_version: ''
    }]
  }) } };
  Logger.log(doPost(fakeE).getContent());
}

/** Reads the Stores tab back as JSON — confirms the app read path works. */
function test_getTab() {
  Logger.log(doGet({ parameter: { action: 'getTab', tab: 'Stores' } }).getContent());
}

/** Confirms the Cellar proxy works from Google's servers. */
function test_resolve() {
  Logger.log(doGet({ parameter: { action: 'resolve', token: storedToken_() || '', q: 'EHT,GTS,Blanton' } }).getContent());
}
