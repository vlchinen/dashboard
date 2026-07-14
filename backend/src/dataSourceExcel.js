const path = require('path');
const XLSX = require('xlsx');

const EXCEL_FILE_PATH = path.join(__dirname, '../data/wallet_transactions.xlsx');

// Re-read the file on every call (no caching) so the dashboard always sees the latest
// data whenever the Excel file is edited. Kept as a reference now that the app reads
// from Google Sheets instead — see dataSourceGgsheet.js.
function getWalletTransactions() {
  const workbook = XLSX.readFile(EXCEL_FILE_PATH, { cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: null });
}

module.exports = { getWalletTransactions };
