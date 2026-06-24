/* Drop Pipeline - FIREHOSE (MANUAL) bookmarklet  (no auto-scroll)
 * ----------------------------------------------------------------
 * Maximum-safety capture: this does NO automated scrolling. YOU scroll the
 * channel by hand at normal speed; each click reads whatever is on screen right
 * now, ADDS it to a running total (kept while the Discord tab stays open), and
 * copies the full total so far to your clipboard.
 *
 * Use: scroll up a bit -> click -> scroll up a bit -> click -> ... when you've
 * covered the range, paste once into the app's "Paste capture" box and Save.
 * Duplicates are removed automatically (by Discord message id). Switching to a
 * different channel, or reloading Discord, starts a fresh total.
 *
 * Because there's zero automation, this is indistinguishable from you reading.
 * No Discord API, no token, no network call from Discord. Needs no config.
 */
(function () {
  function channelName() {
    var sel = ['section[aria-label="Channel header"] h1', 'section[aria-label="Channel header"] [class*="title"]', 'header [class*="title"]', 'h1[class*="title"]'];
    for (var i = 0; i < sel.length; i++) { var el = document.querySelector(sel[i]); if (el && el.textContent.trim()) return el.textContent.trim(); }
    return (document.title || '').replace(/\s*[|\-].*$/, '').trim() || 'unknown';
  }
  function toast(msg, ok) {
    var d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;z-index:999999;top:16px;left:50%;transform:translateX(-50%);'
      + 'background:' + (ok === false ? '#7f1d1d' : '#14532d') + ';color:#fff;padding:11px 18px;'
      + 'border-radius:8px;font:600 14px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.4);max-width:80vw;text-align:center';
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 4500);
  }
  function copyText(t, cb) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { cb(true); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      try { var ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.focus(); ta.select(); var ok = document.execCommand('copy'); ta.remove(); cb(ok); } catch (e) { cb(false); }
    }
  }

  try {
    var chan = channelName();
    // running total persists across clicks while this Discord tab stays open
    if (!window.__dpManual) window.__dpManual = { chan: chan, capturedAt: new Date().toISOString(), collected: {} };
    var store = window.__dpManual;
    if (store.chan !== chan) { store.chan = chan; store.capturedAt = new Date().toISOString(); store.collected = {}; } // new channel -> fresh total

    var lis = document.querySelectorAll('li[id^="chat-messages-"]');
    var lastAuthor = '', lastTs = '', added = 0;
    lis.forEach(function (li) {
      var parts = li.id.split('-'); var msgId = parts[parts.length - 1];
      var authorEl = li.querySelector('[id^="message-username-"]') || li.querySelector('h3 span[class*="username"]') || li.querySelector('span[class*="username"]');
      var author = authorEl ? authorEl.textContent.trim() : lastAuthor; if (authorEl) lastAuthor = author;
      var timeEl = li.querySelector('time[datetime]'); var ts = timeEl ? timeEl.getAttribute('datetime') : lastTs; if (timeEl) lastTs = ts;
      var contentEl = li.querySelector('[id^="message-content-"]'); var text = contentEl ? (contentEl.innerText || contentEl.textContent || '').trim() : '';
      if (!text) return;
      if (!store.collected[msgId]) { store.collected[msgId] = { captured_at: store.capturedAt, channel: chan, msg_author: author, msg_ts: ts, msg_text: text, raw_id: msgId, parsed_version: '' }; added++; }
    });

    var rows = Object.keys(store.collected).map(function (k) { return store.collected[k]; });
    if (!rows.length) { toast('Manual: no messages on screen yet — scroll into the channel and click again.', false); return; }
    copyText(JSON.stringify({ tab: 'raw_channel', rows: rows }), function (ok) {
      if (ok) toast('Manual: +' + added + ' new (total ' + rows.length + ' for #' + chan + '). Scroll & click to add more, or paste now.');
      else toast('Manual: clipboard was blocked - tell Claude.', false);
    });
  } catch (err) { toast('Manual error: ' + err, false); }
})();
