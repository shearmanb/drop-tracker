/* Drop Pipeline - FIREHOSE bookmarklet  (auto-scroll channel -> clipboard)
 * ------------------------------------------------------------------------
 * Click once on a geographic channel. It AUTO-SCROLLS up through the history,
 * collecting every message it renders (deduped by Discord message id), then
 * copies them all to your clipboard as JSON. Paste into the app's "Paste
 * capture" box and Save.
 *
 * Discord only keeps a screenful of messages in the page at once, so a single
 * read would miss older ones - the auto-scroll walks back through them for you.
 * It stops when it reaches the top, stops finding new messages, or hits a cap.
 *
 * No Discord API, no token, no network call from Discord. Needs no config.
 */
(function () {
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
  // the scrollable element that holds the message list
  function findScroller() {
    var li = document.querySelector('li[id^="chat-messages-"]'), el = li;
    while (el) { var st; try { st = getComputedStyle(el); } catch (e) { st = { overflowY: '' }; } if (el.scrollHeight > el.clientHeight + 40 && /auto|scroll/.test(st.overflowY || '')) return el; el = el.parentElement; }
    return document.querySelector('[class*="scroller"]');
  }

  var chan = channelName();
  var capturedAt = new Date().toISOString();
  var collected = {}; // msgId -> row  (dedupes across scroll steps)

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
      if (!collected[msgId]) collected[msgId] = { captured_at: capturedAt, channel: chan, msg_author: author, msg_ts: ts, msg_text: text, raw_id: msgId, parsed_version: '' };
    });
  }

  try {
    var sc = findScroller();
    var status = toast('Firehose: scanning…', true, true);
    var lastN = -1, stable = 0, iter = 0, MAXITER = 500, MAXMSG = 4000;
    function finish() {
      var rows = Object.keys(collected).map(function (k) { return collected[k]; });
      if (status) status.remove();
      if (!rows.length) { toast('Firehose: no messages found on screen', false); return; }
      copyText(JSON.stringify({ tab: 'raw_channel', rows: rows }), function (ok) {
        if (ok) toast('Firehose: copied ' + rows.length + ' messages from #' + chan + '. Now paste into the app.');
        else toast('Firehose: clipboard was blocked - tell Claude.', false);
      });
    }
    function step() {
      collectVisible();
      var n = Object.keys(collected).length;
      if (status) status.textContent = 'Firehose: scanned ' + n + ' messages…';
      iter++;
      var atTop = !sc || sc.scrollTop <= 0;
      if (n === lastN) stable++; else stable = 0;
      lastN = n;
      if (atTop || stable >= 4 || iter >= MAXITER || n >= MAXMSG) { finish(); return; }
      if (sc) sc.scrollTop = Math.max(0, sc.scrollTop - Math.max(220, sc.clientHeight * 0.85));
      setTimeout(step, 320);
    }
    step();
  } catch (err) { toast('Firehose error: ' + err, false); }
})();
