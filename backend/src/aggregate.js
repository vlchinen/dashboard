// Địa chỉ ví chủ dashboard — dùng để xác định chiều giao dịch (gửi/nhận).
// Lấy từ biến môi trường, không hardcode để không lộ địa chỉ khi đưa code lên GitHub.
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;

// Mỗi hàm ở đây làm đúng một việc: nhận danh sách giao dịch (rows), trả về
// dữ liệu đã tính toán sẵn cho một phần cụ thể của dashboard.

function calculateSummary(rows) {
  const totalTransactions = rows.length;
  const totalVolumeEth = sumField(rows, 'ETH');
  const successfulTransactions = rows.filter((row) => row.Status === 'Success').length;
  const successRate = totalTransactions === 0 ? 0 : successfulTransactions / totalTransactions;

  return { totalVolumeEth, totalTransactions, successRate };
}

function calculateMonthlyVolume(rows) {
  const volumeByMonth = new Map();

  for (const row of rows) {
    const monthKey = toMonthKey(row.Time);
    const currentTotal = volumeByMonth.get(monthKey) || 0;
    volumeByMonth.set(monthKey, currentTotal + (row.ETH || 0));
  }

  return [...volumeByMonth.entries()]
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, volume]) => ({ month, volume: roundToSixDecimals(volume) }));
}

function calculateVolumeByCounterparty(rows, topN = 5) {
  const volumeByCounterparty = new Map();

  for (const row of rows) {
    const counterparty = getCounterpartyAddress(row);
    const currentTotal = volumeByCounterparty.get(counterparty) || 0;
    volumeByCounterparty.set(counterparty, currentTotal + (row.ETH || 0));
  }

  return [...volumeByCounterparty.entries()]
    .map(([address, volume]) => ({ address, volume: roundToSixDecimals(volume) }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, topN);
}

function sortTransactionsByTimeDescending(rows) {
  return [...rows].sort((a, b) => new Date(b.Time) - new Date(a.Time));
}

// Gắn thêm nhãn "chiều" (Gửi/Nhận/Nội bộ) cho từng dòng — chỉ cần cho bảng hiển thị.
function attachDirectionLabel(rows) {
  return rows.map((row) => ({ ...row, direction: getDirectionLabel(row) }));
}

function getDirectionLabel(row) {
  const isFromWallet = row.From === WALLET_ADDRESS;
  const isToWallet = row.To === WALLET_ADDRESS;

  if (isFromWallet && isToWallet) return 'Nội bộ';
  if (isFromWallet) return 'Gửi';
  if (isToWallet) return 'Nhận';
  return 'Khác';
}

function getCounterpartyAddress(row) {
  return row.From === WALLET_ADDRESS ? row.To : row.From;
}

function toMonthKey(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function sumField(rows, fieldName) {
  return rows.reduce((sum, row) => sum + (row[fieldName] || 0), 0);
}

function roundToSixDecimals(value) {
  return Math.round(value * 1e6) / 1e6;
}

module.exports = {
  calculateSummary,
  calculateMonthlyVolume,
  calculateVolumeByCounterparty,
  sortTransactionsByTimeDescending,
  attachDirectionLabel,
};
