/* Drop Pipeline - THREAD bookmarklet  (one drop thread -> clipboard)
 * ------------------------------------------------------------------
 * Reads an open drop THREAD and COPIES its messages to your clipboard as JSON.
 * Paste into the Worklist app's "Paste capture" box and Save.
 *
 * Split-screen aware: Discord opens threads in a side panel next to the channel
 * by default. This grabs ONLY the thread's messages (not the channel beside it)
 * by (1) scoping to the thread side-panel when present, and (2) falling back to
 * isolating messages by their thread/channel container id.
 *
 * No Discord API, no token, no network call from Discord. Needs no config.
 */
(function () {
  function toast(msg, ok) {
    var d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;z-index:999999;top:16px;left:50%;transform:translateX(-50%);'
      + 'background:' + (ok === false ? '#7f1d1d' : '#14532d') + ';color:#fff;padding:11px 18px;'
      + 'border-radius:8px;font:600 14px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.4);max-width:80vw;text-align:center';
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 6000);
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

  // store from a TITLE ("!drop 267 ..." or "267 McLean") - whole-number, prefers the !drop form
  function storeFromTitle(t) { t = t || ''; var m = t.match(/!drop\s+(\d{2,3})/i) || t.match(/\b(\d{2,3})\b/); return m ? Number(m[1]) : ''; }
  // store from message text - ONLY a "!drop NNN" or "started a thread ... NNN" cue, never a bare number (avoids "ER 10")
  function storeFromText(t) { t = t || ''; var m = t.match(/!drop\s+(\d{2,3})/i) || t.match(/started a thread[\s\S]*?(\d{2,3})/i); return m ? Number(m[1]) : ''; }

  // Find the thread's store # + name from any short heading / breadcrumb / sidebar label
  // that contains "!drop NNN" (preferred), else a short label with a bare 2-3 digit number.
  // Searches the whole document so it works in both full and split-screen views.
  function findStore() {
    var all = document.querySelectorAll('h1,h2,h3,[role="heading"],[class*="title"],[class*="threadName"],[class*="name"]');
    var i, t, m;
    for (i = 0; i < all.length; i++) { t = (all[i].textContent || '').trim(); if (t && t.length < 140) { m = t.match(/!drop\s+(\d{2,3})/i); if (m) return { store: Number(m[1]), title: t }; } }
    for (i = 0; i < all.length; i++) { t = (all[i].textContent || '').trim(); if (t && t.length < 60) { m = t.match(/\b(\d{2,3})\b/); if (m) return { store: Number(m[1]), title: t }; } }
    return { store: '', title: '' };
  }

  // Read all rendered messages (within `scope`), keeping author/timestamp carry-forward
  // per container, and tagging each row with its container id (the bit of the <li> id
  // between "chat-messages-" and the message id == the channel or thread id).
  function gather(scope) {
    var lis = scope.querySelectorAll('li[id^="chat-messages-"]');
    var carry = {}, order = [], rows = [];
    lis.forEach(function (li) {
      var parts = li.id.split('-');
      var msgId = parts[parts.length - 1];
      var cid = parts[parts.length - 2] || '';
      if (!carry[cid]) { carry[cid] = { a: '', t: '' }; order.push(cid); }
      var authorEl = li.querySelector('[id^="message-username-"]')
        || li.querySelector('h3 span[class*="username"]')
        || li.querySelector('span[class*="username"]');
      var author = authorEl ? authorEl.textContent.trim() : carry[cid].a;
      if (authorEl) carry[cid].a = author;
      var timeEl = li.querySelector('time[datetime]');
      var ts = timeEl ? timeEl.getAttribute('datetime') : carry[cid].t;
      if (timeEl) carry[cid].t = ts;
      var contentEl = li.querySelector('[id^="message-content-"]');
      var text = contentEl ? (contentEl.innerText || contentEl.textContent || '').trim() : '';
      if (!text) return;
      rows.push({ cid: cid, author: author, ts: ts, text: text, msgId: msgId });
    });
    return { rows: rows, order: order };
  }

  try {
    // Prefer the thread side-panel if Discord rendered one (split-screen view).
    var panel = document.querySelector('[class*="threadSidebar"]')
      || document.querySelector('[class*="threadSidebarOpen"]');
    var scope = panel || document;

    var g = gather(scope);
    if (!g.rows.length) { toast('Thread: no messages found on screen', false); return; }

    // If we couldn't scope to a panel but there are multiple containers on screen
    // (channel + thread), the thread renders last -> keep only the last container's messages.
    var msgs = g.rows;
    if (!panel && g.order.length > 1) {
      var threadCid = g.rows[g.rows.length - 1].cid;
      msgs = g.rows.filter(function (r) { return r.cid === threadCid; });
    }

    var found = findStore();
    var store = found.store, title = found.title || '(thread)';
    // fallback: scan messages for a "!drop NNN" / "started a thread ... NNN" cue
    if (store === '') { for (var i = 0; i < g.rows.length; i++) { var s = storeFromText(g.rows[i].text); if (s) { store = s; break; } } }

    var capturedAt = new Date().toISOString();
    var rows = msgs.map(function (m) {
      return { captured_at: capturedAt, thread_title: title, store_guess: store, msg_author: m.author,
        msg_ts: m.ts, msg_text: m.text, raw_id: m.msgId, parsed_version: '' };
    });
    var payload = JSON.stringify({ tab: 'raw_threads', rows: rows });
    copyText(payload, function (ok) {
      if (!ok) { toast('Thread: clipboard was blocked - tell Claude.', false); return; }
      if (store === '') toast('Thread: copied ' + rows.length + ' messages, but no store # found - set it in the app, or make sure the thread name starts with the store number.', false);
      else toast('Thread: copied ' + rows.length + ' messages (store ' + store + '). Now paste into the app’s "Paste capture" box.');
    });
  } catch (err) { toast('Thread error: ' + err, false); }
})();
