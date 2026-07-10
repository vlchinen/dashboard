import { useState } from 'react';
import { fetchTransactionsViaSocket } from '../api/walletSocketApi';
import { usePolling } from '../hooks/usePolling';

const PAGE_SIZE = 10;
const POLL_INTERVAL_MS = 5000;

function formatTime(dateValue) {
  return new Date(dateValue).toLocaleString('vi-VN');
}

function truncateHash(hash) {
  return `${hash.slice(0, 2)}...${hash.slice(-2)}`;
}

function truncateAddress(address) {
  return `${address.slice(0, 2)}...${address.slice(-2)}`;
}

function getCounterpartyForDisplay(tx) {
  return tx.direction === 'Gửi' ? tx.To : tx.From;
}

export default function TransactionsTable() {
  const [page, setPage] = useState(1);
  const data = usePolling(() => fetchTransactionsViaSocket(page, PAGE_SIZE), POLL_INTERVAL_MS, [page]);

  if (!data) {
    return null;
  }

  const totalPages = Math.ceil(data.total / PAGE_SIZE);

  function goToPreviousPage() {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  }

  function goToNextPage() { 
    setPage((currentPage) => Math.min(totalPages, currentPage + 1));
  }

  return (
    <div className="table-card">
      <h3>Giao dịch gần đây</h3>
      <table>
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Hash</th>
            <th>Chiều</th>
            <th>Đối tác</th>
            <th>ETH</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((tx) => (
            <tr key={tx.Hash}>
              <td>{formatTime(tx.Time)}</td>
              <td>{truncateHash(tx.Hash)}</td>
              <td>{tx.direction}</td>
              <td>{truncateAddress(getCounterpartyForDisplay(tx))}</td>
              <td>{tx.ETH.toFixed(6)}</td>
              <td>{tx.Status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={page <= 1}>
          Trước
        </button>
        <span>
          Trang {page}/{totalPages}
        </span>
        <button onClick={goToNextPage} disabled={page >= totalPages}>
          Sau
        </button>
      </div>
    </div>
  );
}
