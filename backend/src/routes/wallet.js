const express = require('express');
const { getWalletTransactions } = require('../dataSourceGgsheet');
const {
  calculateSummary,
  calculateMonthlyVolume,
  calculateVolumeByCounterparty,
  sortTransactionsByTimeDescending,
  attachDirectionLabel,
  paginate
} = require('../aggregate');

const router = express.Router();

router.get('/summary', async (req, res) => {
  const rows = await getWalletTransactions();
  res.json(calculateSummary(rows));
});

router.get('/monthly-volume', async (req, res) => {
  const rows = await getWalletTransactions();
  res.json(calculateMonthlyVolume(rows));
});

router.get('/top-counterparties', async (req, res) => {
  const rows = await getWalletTransactions();
  res.json(calculateVolumeByCounterparty(rows));
});

router.get('/transactions', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;

  const rows = await getWalletTransactions();
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


module.exports = router;
