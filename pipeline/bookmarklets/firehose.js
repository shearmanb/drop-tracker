/* Drop Pipeline — FIREHOSE bookmarklet  (geographic channel -> raw_channel)
 * --------------------------------------------------------------------------
 * Click this while viewing a geographic drop channel (e.g. Fairfax, Loudoun).
 * It reads every message currently rendered on screen and ships them, one row
 * per message, to the raw_channel tab. Scroll up to load more history, then
 * click again — duplicates are skipped server-side via the Discord message id.
 *
 * This is where "nada"/"dry" negatives get captured for free: they live in the
 * channel feed (they don't create threads), so the firehose sweeps them up.
 *
 * No Discord API and no token are used — it only reads the page you're already
 * looking at, exactly like reading it yourself.
 *
 * CONFIG: install.html fills in __SCRIPT_URL__ and __TOKEN__ when it builds the
 * bookmarklet. To hand-edit, replace those two strings below.
 */
(function () {
  var CONFIG = { scriptUrl: '__SCRIPT_URL__', token: '__TOKEN__' };

  // ---- find the channel/thread name from the Discord header ----
  function channelName() {
    var sel = [
      'section[aria-label="Channel header"] h1',
      'section[aria-label="Channel header"] [class*="title"]',
      'header [class*="title"]',
      'h1[class*="title"]'
    ];
    for (var i = 0; i < sel.length; i++) {
      var el = document.querySelector(sel[i]);
      if (el && el.textContent.trim()) return el.textContent.trim();
    }
    return (document.title || '').replace(/\s*[|\-–].*$/, '').trim() || 'unknown';
  }

  // ---- read all rendered messages (handles Discord's grouped messages) ----
  function extractMessages() {
    var lis = document.querySelectorAll('li[id^="chat-messages-"]');
    var out = [], lastAuthor = '', lastTs = '';
    lis.forEach(function (li) {
      var parts = li.id.split('-');
      var msgId = parts[parts.length - 1];

      var authorEl = li.querySelector('[id^="message-username-"]')
        || li.querySelector('h3 span[class*="username"]')
        || li.querySelector('span[class*="username"]');
      var author = authorEl ? authorEl.textContent.trim() : lastAuthor;
      if (authorEl) lastAuthor = author;

      var timeEl = li.querySelector('time[datetime]');
      var ts = timeEl ? timeEl.getAttribute('datetime') : lastTs;
      if (timeEl) lastTs = ts;

      var contentEl = li.querySelector('[id^="message-content-"]');
      var text = contentEl ? (contentEl.innerText || contentEl.textContent || '').trim() : '';
      if (!text) return; // skip embed-only / system rows

      out.push({ author: author, ts: ts, text: text, msgId: msgId });
    });
    return out;
  }

  function toast(msg, ok) {
    var d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;z-index:999999;top:16px;left:50%;transform:translateX(-50%);'
      + 'background:' + (ok === false ? '#7f1d1d' : '#14532d') + ';color:#fff;padding:10px 16px;'
      + 'border-radius:8px;font:600 14px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.4)';
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 3500);
  }

  try {
    var chan = channelName();
    var msgs = extractMessages();
    if (!msgs.length) { toast('Firehose: no messages found on screen', false); return; }

    var capturedAt = new Date().toISOString();
    var rows = msgs.map(function (m) {
      return {
        captured_at: capturedAt,
        channel: chan,
        msg_author: m.author,
        msg_ts: m.ts,
        msg_text: m.text,
        raw_id: m.msgId,
        parsed_version: ''
      };
    });

    fetch(CONFIG.scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // fire-and-forget; response is opaque, dedup handles re-clicks
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: CONFIG.token, tab: 'raw_channel', rows: rows })
    }).then(function () {
      toast('Firehose: sent ' + rows.length + ' msgs from #' + chan);
    }).catch(function (e) {
      toast('Firehose send failed: ' + e, false);
    });
  } catch (err) {
    toast('Firehose error: ' + err, false);
  }
})();
