// ============================================
// Google Apps Script — Logo Board Backend
// ============================================
// 1. افتح Google Sheet جديد
// 2. Extensions → Apps Script
// 3. امسح الكود الموجود والصق هذا الكود
// 4. اضغط Deploy → New deployment
// 5. Type: Web app
// 6. Execute as: Me
// 7. Who has access: Anyone
// 8. اضغط Deploy وانسخ الرابط
// ============================================

const SHEET_NAME = 'Suggestions';

function doGet(e) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => row[h] = data[i][j]);
    rows.push(row);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', data: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = getOrCreateSheet();
  const payload = JSON.parse(e.postData.contents);
  const action = payload.action;
  
  if (action === 'add') {
    const item = payload.item;
    sheet.appendRow([
      item.id || new Date().getTime(),
      item.name,
      item.category,
      item.subCategory || '',
      item.addedBy || 'Anonymous',
      new Date().toISOString(),
      item.hasImage ? 'Yes' : 'No'
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Added' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'delete') {
    const id = String(payload.id);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Deleted' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'clear') {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Cleared' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['id', 'name', 'category', 'subCategory', 'addedBy', 'timestamp', 'hasImage']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
  }
  return sheet;
}
