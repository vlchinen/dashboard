const path = require('path');
const XLSX = require('xlsx');

const EXCEL_FILE_PATH = path.join(__dirname, '../data/wallet_transactions.xlsx');

// Đọc lại file mỗi lần gọi (không cache) để dashboard luôn thấy dữ liệu mới nhất
// khi file Excel bị chỉnh sửa. Giai đoạn sau sẽ thay nội dung hàm này bằng gọi
// Google Sheets API — phần còn lại của app không cần đổi gì.
function getWalletTransactions() {
  const workbook = XLSX.readFile(EXCEL_FILE_PATH, { cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: null });
}

module.exports = { getWalletTransactions };
