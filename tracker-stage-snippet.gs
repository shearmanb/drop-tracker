/* =========================================================================
 * STAGED THREAD COLLECTION — additive add-on for the TRACKER Sheet's script
 * -------------------------------------------------------------------------
 * Adds two actions used by thread-queue.html:
 *   ?action=dropsAll                      -> reads the ENTIRE Drops tab
 *                                            (all columns, incl. Stage / ThreadRaw)
 *   ?action=dropSet&token=..&data=[..]    -> writes any column(s) by header name
 *                                            for a matching dropId
 *
 * It does NOT modify getDrops / updateDrop / anything you already have.
 * Unknown columns are skipped (not an error), so you can add more columns
 * later (SoldOutTime, ActualDropTime, ...) with no further code changes.
 *
 * HOW TO INSTALL (one time):
 *   1. Open the TRACKER Google Sheet (the one your main app reads) ->
 *      Extensions -> Apps Script.
 *   2. At the very top of your existing  function doGet(e) {  paste these
 *      TWO lines right after the opening brace:
 *
 *          var __a = (e && e.parameter && e.parameter.action) || '';
 *          if (__a === 'dropsAll' || __a === 'dropSet') return dtHandle_(e.parameter);
 *
 *   3. Paste EVERYTHING BELOW at the very bottom of the file.
 *   4. Deploy -> Manage deployments -> (edit) -> Version: New version -> Deploy.
 * ========================================================================= */

var DT_SHEET_ID = '1BPPZsFvoeNWiH5rC8x3PSsKUOEq7GhPhD5qgEC5DWy4'; // tracker Sheet
var DT_TOKEN    = 'PkuEzRzlltYwajakc2a0PThQIo2Nw8Ky';             // same token index.html sends
var DT_TAB      = 'Drops';

function dtSS_()      { return SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(DT_SHEET_ID); }
function dtJson_(o)   { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function dtHandle_(p) {
  try {
    var sh = dtSS_().getSheetByName(DT_TAB);
    if (!sh) return dtJson_({ success: false, error: 'Drops tab not found' });
    var values = sh.getDataRange().getValues();
    var hdr = values[0].map(function (h) { return String(h).trim(); });

    // --- READ: full sheet, every column (array-of-arrays, header first) ---
    if (p.action === 'dropsAll') {
      return dtJson_({ success: true, rows: values });
    }

    // --- WRITE: set any column(s) by header name for a matching dropId ---
    if (p.action === 'dropSet') {
      if (p.token !== DT_TOKEN) return dtJson_({ success: false, error: 'Unauthorized' });
      var idIdx = hdr.indexOf('dropId');
      if (idIdx === -1) return dtJson_({ success: false, error: 'no dropId column' });

      var items = JSON.parse(p.data || '[]');       // [{ dropId, fields: { Stage:'03', ThreadRaw:'...' } }, ...]
      if (!Array.isArray(items)) items = [items];

      var idToRow = {};
      for (var r = 1; r < values.length; r++) {
        var k = values[r][idIdx];
        if (k !== '' && k != null) idToRow[String(k)] = r + 1; // 1-based sheet row
      }

      var updated = 0, missing = [], unknownCols = {};
      items.forEach(function (it) {
        var row = idToRow[String(it.dropId)];
        if (!row) { missing.push(it.dropId); return; }
        var f = it.fields || {};
        Object.keys(f).forEach(function (col) {
          var c = hdr.indexOf(col);
          if (c === -1) { unknownCols[col] = true; return; } // skip columns that don't exist yet
          sh.getRange(row, c + 1).setValue(f[col]);
        });
        updated++;
      });
      return dtJson_({ success: true, updated: updated, missing: missing, unknownCols: Object.keys(unknownCols) });
    }

    return dtJson_({ success: false, error: 'dtHandle_ got unexpected action: ' + p.action });
  } catch (err) {
    return dtJson_({ success: false, error: String(err) });
  }
}
