function formatEth(value) {
  return `${value.toFixed(6)} ETH`;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

export default function StatCards({ summary }) {
  if (!summary) {
    return null;
  }

  return (
    <div className="stat-cards">
      <div className="stat-card">
        <div className="stat-label">Total Transaction Volume</div>
        <div className="stat-value">{formatEth(summary.totalVolumeEth)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Transactions</div>
        <div className="stat-value">{summary.totalTransactions.toLocaleString()}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Success Rate</div>
        <div className="stat-value">{formatPercent(summary.successRate)}</div>
      </div>
    </div>
  );
}
