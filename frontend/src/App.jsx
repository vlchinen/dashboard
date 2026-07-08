import { fetchSummary, fetchMonthlyVolume, fetchTopCounterparties } from './api/walletApi';
import { useState } from 'react'; 
import { usePolling } from './hooks/usePolling';
import StatCards from './components/StatCards';
import VolumeLineChart from './components/VolumeLineChart';
import CounterpartyBarChart from './components/CounterpartyBarChart';
import TransactionsTable from './components/TransactionsTable';
import { useWalletSocket } from './hooks/useWalletSocket';


const POLL_INTERVAL_MS = 5000;

export default function App() {
  const [showTest, setShowTest] = useState(true);
  const summary = useWalletSocket('summary');
  const monthlyVolume = useWalletSocket('monthlyVolume');
  const topCounterparties = useWalletSocket('topCounterparties');

  function handleToggleClick() {
    setShowTest((currentValue) => !currentValue);
  }

  return (
    <div className="app">
      <button onClick={handleToggleClick}>{showTest ? 'Ẩn data' : 'Hiện data'}</button>
       {showTest && (
        <>
          <h1>Wallet Dashboard - this project for research only</h1>
          <StatCards summary={summary} />
          <div className="charts">
            <VolumeLineChart data={monthlyVolume} />
            <CounterpartyBarChart data={topCounterparties} />
          </div>
          <TransactionsTable />
        </>
      )}
    </div>
  );
}
