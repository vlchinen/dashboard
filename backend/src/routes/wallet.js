const express = require('express');
const { getWalletTransactions } = require('../dataSource');
const {
  calculateSummary,
  calculateMonthlyVolume,
  calculateVolumeByCounterparty,
  sortTransactionsByTimeDescending,
  attachDirectionLabel,
} = require('../aggregate');

const router = express.Router();

router.get('/summary', (req, res) => {
  const rows = getWalletTransactions();
  res.json(calculateSummary(rows));
});

router.get('/monthly-volume', (req, res) => {
  const rows = getWalletTransactions();
  res.json(calculateMonthlyVolume(rows));
});

router.get('/top-counterparties', (req, res) => {
  const rows = getWalletTransactions();
  res.json(calculateVolumeByCounterparty(rows));
});

router.get('/transactions', (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;

  const rows = getWalletTransactions();
  const sortedRows = sortTransactionsByTimeDescending(rows);
  const labeledRows = attachDirectionLabel(sortedRows);
  const pagedRows = paginate(labeledRows, page, pageSize);

  res.json({
    rows: pagedRows,
    total: rows.length,
    page,
    pageSize,
  });
});

function paginate(items, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

module.exports = router;
