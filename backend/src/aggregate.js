// Dashboard owner's wallet address — used to determine transaction direction (sent/received).
// Read from an environment variable, never hardcoded, so it isn't exposed when the code is pushed to GitHub.
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;

// Each function here does exactly one thing: takes the list of transactions (rows) and
// returns data already computed for one specific part of the dashboard.

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

// Attach a "direction" label (Sent/Received/Internal) to each row — only needed for table display.
function attachDirectionLabel(rows) {
  return rows.map((row) => ({ ...row, direction: getDirectionLabel(row) }));
}

function getDirectionLabel(row) {
  const isFromWallet = row.From === WALLET_ADDRESS;
  const isToWallet = row.To === WALLET_ADDRESS;

  if (isFromWallet && isToWallet) return 'Internal';
  if (isFromWallet) return 'Sent';
  if (isToWallet) return 'Received';
  return 'Other';
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

function paginate(items, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

module.exports = {
  calculateSummary,
  calculateMonthlyVolume,
  calculateVolumeByCounterparty,
  sortTransactionsByTimeDescending,
  attachDirectionLabel,
  paginate
};
