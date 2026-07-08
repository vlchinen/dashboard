const { getWalletTransactions } = require('./dataSource');
const {
  calculateSummary,
  calculateMonthlyVolume,
  calculateVolumeByCounterparty,
} = require('./aggregate');

const BROADCAST_INTERVAL_MS = 5000;

function getRealtimeWalletData() {
  const rows = getWalletTransactions();
  return {
    summary: calculateSummary(rows),
    monthlyVolume: calculateMonthlyVolume(rows),
    topCounterparties: calculateVolumeByCounterparty(rows),
  };
}

function emitWalletData(target) {
  const data = getRealtimeWalletData();
  target.emit('summary', data.summary);
  target.emit('monthlyVolume', data.monthlyVolume);
  target.emit('topCounterparties', data.topCounterparties);
}

function setupRealtimeUpdates(io) {
  io.on('connection', (socket) => {
    console.log(`Client kết nối: ${socket.id} (tổng đang mở: ${io.engine.clientsCount})`);
    emitWalletData(socket);

    socket.on('disconnect', () => {
      console.log(`Client ngắt kết nối: ${socket.id} (còn lại: ${io.engine.clientsCount})`);
    });
  });

  setInterval(() => {
    console.log(`Chuẩn bị đẩy data cho ${io.engine.clientsCount} client...`);
    emitWalletData(io);
  }, BROADCAST_INTERVAL_MS);
}

module.exports = { setupRealtimeUpdates };