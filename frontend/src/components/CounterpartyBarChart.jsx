import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function truncateAddress(address) {
  return `${address.slice(0, 2)}...${address.slice(-2)}`;
}

export default function CounterpartyBarChart({ data }) {
  if (!data) {
    return null;
  }

  const chartData = data.map((item) => ({
    ...item,
    label: truncateAddress(item.address),
  }));

  return (
    <div className="chart-card">
      <h3>Top 5 Counterparties by Volume</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip formatter={(value) => `${value} ETH`} />
          <Bar dataKey="volume" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
