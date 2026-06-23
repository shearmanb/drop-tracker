/* Drop Pipeline - THREAD bookmarklet  (one drop thread -> clipboard)
 * ------------------------------------------------------------------
 * Click this while viewing a single drop THREAD. It reads every rendered
 * message and COPIES them to your clipboard as JSON. Then paste that into the
 * Worklist app's "Paste capture" box and click Save.
 *
 * Why copy instead of send? Discord's security policy (CSP) blocks its pages
 * from sending data to outside servers. Copying is not blocked; the app writes
 * to the sheet. No Discord API, no token, no network call from Discord.
 *
 * This bookmarklet needs NO configuration - no URL, no token.
 */
(function () {
  function threadTitle() {
    var sel = ['section[aria-label="Channel header"] h1',
      'section[aria-label="Channel header"] [class*="title"]',
      '[class*="threadName"]', 'header [class*="title"]', 'h1[class*="title"]'];
    for (var i = 0; i < sel.length; i++) {
      var el = document.querySelector(sel[i]);
      if (el && el.textContent.trim()) return el.textContent.trim();
    }
    return (document.title || '').replace(/\s*[|\-].*$/, '').trim() || 'unknown';
  }

  function storeGuess(title) {
    var m = (title || '').match(/\b(\d{2,3})\b/);
    return m ? Number(m[1]) : '';
  }

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
      if (!text) return;
      out.push({ author: author, ts: ts, text: text, msgId: msgId });
    });
    return out;
  }

  function toast(msg, ok) {
    var d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;z-index:999999;top:16px;left:50%;transform:translateX(-50%);'
      + 'background:' + (ok === false ? '#7f1d1d' : '#14532d') + ';color:#fff;padding:11px 18px;'
      + 'border-radius:8px;font:600 14px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.4);max-width:80vw;text-align:center';
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 5000);
  }

  function copyText(t, cb) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { cb(true); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = t; ta.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        var ok = document.execCommand('copy'); ta.remove(); cb(ok);
      } catch (e) { cb(false); }
    }
  }

  try {
    var title = threadTitle();
    var store = storeGuess(title);
    var msgs = extractMessages();
    if (!msgs.length) { toast('Thread: no messages found on screen', false); return; }
    var capturedAt = new Date().toISOString();
    var rows = msgs.map(function (m) {
      return { captured_at: capturedAt, thread_title: title, store_guess: store, msg_author: m.author,
        msg_ts: m.ts, msg_text: m.text, raw_id: m.msgId, parsed_version: '' };
    });
    var payload = JSON.stringify({ tab: 'raw_threads', rows: rows });
    copyText(payload, function (ok) {
      if (ok) toast('Thread: copied ' + rows.length + ' messages (store ' + (store || '?') + '). Now paste into the app’s "Paste capture" box.');
      else toast('Thread: clipboard was blocked - tell Claude.', false);
    });
  } catch (err) { toast('Thread error: ' + err, false); }
})();
