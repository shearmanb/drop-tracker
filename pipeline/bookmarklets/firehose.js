/* Drop Pipeline - FIREHOSE bookmarklet  (auto-scroll channel -> clipboard)
 * ------------------------------------------------------------------------
 * Click once on a geographic channel. It asks for an optional "stop at date",
 * then AUTO-SCROLLS up through the history, collecting every message it renders
 * (deduped by Discord message id), and copies them all to your clipboard as JSON.
 * Paste into the app's "Paste capture" box and Save.
 *
 * Backfill: enter a date (YYYY-MM-DD) and it scrolls back until it passes that
 * date, then stops. Leave it blank to grab as far back as it can (up to the cap).
 * Re-running picks up from where you left off; dedup merges any overlap, so you
 * can walk a year back month-by-month safely.
 *
 * No Discord API, no token, no network call from Discord. Needs no config.
 */
(function () {
  // Capture speed. The installer (install.html) rewrites THIS exact line to bake a chosen
  // preset into the button — keep it on one line, format `var SPEED = { ... };  // __DP_SPEED__`.
  // min/max = ms to wait between scroll steps (fast while messages load, up to max when stalled);
  // frac = how much of a screenful to jump per step (bigger = faster, but less render overlap).
  var SPEED = { min: 220, max: 1500, frac: 0.85 };  // __DP_SPEED__
  function channelName() {
    var sel = ['section[aria-label="Channel header"] h1', 'section[aria-label="Channel header"] [class*="title"]', 'header [class*="title"]', 'h1[class*="title"]'];
    for (var i = 0; i < sel.length; i++) { var el = document.querySelector(sel[i]); if (el && el.textContent.trim()) return el.textContent.trim(); }
    return (document.title || '').replace(/\s*[|\-].*$/, '').trim() || 'unknown';
  }
  function toast(msg, ok, persist) {
    var d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;z-index:999999;top:16px;left:50%;transform:translateX(-50%);'
      + 'background:' + (ok === false ? '#7f1d1d' : '#14532d') + ';color:#fff;padding:11px 18px;'
      + 'border-radius:8px;font:600 14px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.4);max-width:80vw;text-align:center';
    document.body.appendChild(d);
    if (!persist) setTimeout(function () { d.remove(); }, 5000);
    return d;
  }
  function copyText(t, cb) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { cb(true); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      try { var ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.focus(); ta.select(); var ok = document.execCommand('copy'); ta.remove(); cb(ok); } catch (e) { cb(false); }
    }
  }
  function findScroller() {
    var li = document.querySelector('li[id^="chat-messages-"]'), el = li;
    while (el) { var st; try { st = getComputedStyle(el); } catch (e) { st = { overflowY: '' }; } if (el.scrollHeight > el.clientHeight + 40 && /auto|scroll/.test(st.overflowY || '')) return el; el = el.parentElement; }
    return document.querySelector('[class*="scroller"]');
  }

  // server + channel id from the Discord URL (/channels/<guild>/<channel>); '@me' for DMs.
  // A "!drop" message starts a thread whose id == the message id, so the app can turn this
  // per-message deep link into a thread link later. Captured once; same for every row.
  function loc() { var m = (location.pathname || '').match(/\/channels\/(\d+|@me)\/(\d+)/); return m ? { g: m[1], c: m[2] } : { g: '', c: '' }; }
  function msgLink(loc, msgId) { return (loc.g && loc.c && /^\d+$/.test(loc.g)) ? 'https://discord.com/channels/' + loc.g + '/' + loc.c + '/' + msgId : ''; }

  // Keep the SCREEN awake for the whole run so an idle lock screen / display sleep
  // can't suspend the page and kill a long backfill. Re-acquired if the OS drops it.
  var wakeLock = null;
  function acquireWake() {
    try {
      if (navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request('screen').then(function (w) {
          wakeLock = w; w.addEventListener('release', function () { wakeLock = null; });
        }, function () {});
      }
    } catch (e) {}
  }
  function releaseWake() { try { if (wakeLock) { wakeLock.release(); } wakeLock = null; } catch (e) {} }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) acquireWake(); });
  acquireWake();

  var chan = channelName();
  var capturedAt = new Date().toISOString();
  var here = loc();
  var collected = {}; // msgId -> row (dedupes across scroll steps)

  function collectVisible() {
    var lis = document.querySelectorAll('li[id^="chat-messages-"]');
    var lastAuthor = '', lastTs = '';
    lis.forEach(function (li) {
      var parts = li.id.split('-'); var msgId = parts[parts.length - 1];
      var authorEl = li.querySelector('[id^="message-username-"]') || li.querySelector('h3 span[class*="username"]') || li.querySelector('span[class*="username"]');
      var author = authorEl ? authorEl.textContent.trim() : lastAuthor; if (authorEl) lastAuthor = author;
      var timeEl = li.querySelector('time[datetime]'); var ts = timeEl ? timeEl.getAttribute('datetime') : lastTs; if (timeEl) lastTs = ts;
      var contentEl = li.querySelector('[id^="message-content-"]'); var text = contentEl ? (contentEl.innerText || contentEl.textContent || '').trim() : '';
      if (!text) return;
      if (!collected[msgId]) collected[msgId] = { captured_at: capturedAt, channel: chan, msg_author: author, msg_ts: ts, msg_text: text, raw_id: msgId, msg_link: msgLink(here, msgId), parsed_version: '' };
    });
  }
  function oldestMs() {
    var min = Infinity;
    for (var k in collected) { var t = collected[k].msg_ts; if (t) { var ms = new Date(t).getTime(); if (!isNaN(ms) && ms < min) min = ms; } }
    return min;
  }
  function fmt(ms) { if (ms === Infinity) return '?'; try { return new Date(ms).toISOString().slice(0, 10); } catch (e) { return '?'; } }

  try {
    var ans = prompt('Backfill — stop when you reach this date (YYYY-MM-DD).\nLeave blank to grab as far back as it can.', '');
    var targetMs = null;
    if (ans && /\d{4}-\d{2}-\d{2}/.test(ans)) { var dd = new Date(ans.trim().slice(0, 10) + 'T00:00:00'); if (!isNaN(dd)) targetMs = dd.getTime(); }
    var sc = findScroller();
    var status = toast('Firehose: scanning…', true, true);
    var lastN = -1, stable = 0, iter = 0, MAXITER = 3000, MAXMSG = 12000;
    // Adaptive pace: scroll fast while new messages keep loading; only slow down when the
    // count stops growing (Discord is still rendering, or we've hit the top). Self-correcting —
    // if a big jump outruns the render, growth stalls, we back off, it catches up. Much faster
    // than the old fixed 700-1400ms-per-step wait, without skipping messages.
    var MINDELAY = SPEED.min, MAXDELAY = SPEED.max, delay = MINDELAY;
    function finish() {
      releaseWake();
      var rows = Object.keys(collected).map(function (k) { return collected[k]; });
      if (status) status.remove();
      if (!rows.length) { toast('Firehose: no messages found on screen', false); return; }
      copyText(JSON.stringify({ tab: 'raw_channel', rows: rows }), function (ok) {
        if (ok) toast('Firehose: copied ' + rows.length + ' messages from #' + chan + ' (back to ' + fmt(oldestMs()) + '). Now paste into the app.');
        else toast('Firehose: clipboard was blocked - tell Claude.', false);
      });
    }
    function step() {
      // A hidden tab/window stops rendering, so Discord can't load older messages — pause
      // (don't silently stall) and tell the user, then resume the moment it's visible again.
      if (document.hidden) {
        if (status) status.textContent = 'Firehose: paused — bring this window to the front to keep capturing…';
        setTimeout(step, 500);
        return;
      }
      collectVisible();
      var n = Object.keys(collected).length;
      var oldest = oldestMs();
      iter++;
      var atTop = !sc || sc.scrollTop <= 0;
      var hitDate = targetMs && oldest !== Infinity && oldest <= targetMs;
      if (n > lastN) { stable = 0; delay = MINDELAY; }                     // new messages -> stay fast
      else { stable++; delay = Math.min(MAXDELAY, Math.round(delay * 1.7)); } // nothing new -> let it render
      lastN = n;
      if (status) status.textContent = 'Firehose: ' + n + ' messages, back to ' + fmt(oldest) + '…';
      if (atTop || hitDate || stable >= 8 || iter >= MAXITER || n >= MAXMSG) { finish(); return; }
      if (sc) sc.scrollTop = Math.max(0, sc.scrollTop - Math.max(300, sc.clientHeight * SPEED.frac));
      setTimeout(step, delay);
    }
    step();
  } catch (err) { releaseWake(); toast('Firehose error: ' + err, false); }
})();
