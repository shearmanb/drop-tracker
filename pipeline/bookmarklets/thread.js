/* Drop Pipeline — THREAD bookmarklet  (one drop thread -> raw_threads)
 * --------------------------------------------------------------------
 * Click this while viewing a single drop THREAD (the conversation that opens
 * when someone posts "!drop <store#> ..."). It reads every rendered message in
 * the thread — the bottle ledger that accretes across messages, people, and
 * sometimes days — and ships them one row per message to the raw_threads tab.
 *
 * It also records the thread title and a best-guess store number parsed from it.
 * Scroll up to load older messages, then click again; duplicates are skipped
 * server-side via the Discord message id.
 *
 * CONFIG: install.html fills in __SCRIPT_URL__ and __TOKEN__ when it builds the
 * bookmarklet. To hand-edit, replace those two strings below.
 */
(function () {
  var CONFIG = { scriptUrl: '__SCRIPT_URL__', token: '__TOKEN__' };

  function threadTitle() {
    var sel = [
      'section[aria-label="Channel header"] h1',
      'section[aria-label="Channel header"] [class*="title"]',
      '[class*="threadName"]',
      'header [class*="title"]',
      'h1[class*="title"]'
    ];
    for (var i = 0; i < sel.length; i++) {
      var el = document.querySelector(sel[i]);
      if (el && el.textContent.trim()) return el.textContent.trim();
    }
    return (document.title || '').replace(/\s*[|\-–].*$/, '').trim() || 'unknown';
  }

  function storeGuess(title) {
    var m = (title || '').match(/\b(\d{2,3})\b/); // first 2-3 digit number in the title
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
      + 'background:' + (ok === false ? '#7f1d1d' : '#14532d') + ';color:#fff;padding:10px 16px;'
      + 'border-radius:8px;font:600 14px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.4)';
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 3500);
  }

  try {
    var title = threadTitle();
    var store = storeGuess(title);
    var msgs = extractMessages();
    if (!msgs.length) { toast('Thread: no messages found on screen', false); return; }

    var capturedAt = new Date().toISOString();
    var rows = msgs.map(function (m) {
      return {
        captured_at: capturedAt,
        thread_title: title,
        store_guess: store,
        msg_author: m.author,
        msg_ts: m.ts,
        msg_text: m.text,
        raw_id: m.msgId,
        parsed_version: ''
      };
    });

    fetch(CONFIG.scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: CONFIG.token, tab: 'raw_threads', rows: rows })
    }).then(function () {
      toast('Thread: sent ' + rows.length + ' msgs (store ' + (store || '?') + ')');
    }).catch(function (e) {
      toast('Thread send failed: ' + e, false);
    });
  } catch (err) {
    toast('Thread error: ' + err, false);
  }
})();
