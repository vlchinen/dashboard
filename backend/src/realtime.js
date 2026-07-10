const { getWalletTransactions } = require('./dataSource');
const {
  calculateSummary,
  calculateMonthlyVolume,
  calculateVolumeByCounterparty,
} = require('./aggregate');

const BROADCAST_INTERVAL_MS = 5000;

let cache = null;

function getRealtimeWalletData() {
  const rows = getWalletTransactions();

  return {
    summary: calculateSummary(rows),
    monthlyVolume: calculateMonthlyVolume(rows),
    topCounterparties: calculateVolumeByCounterparty(rows),
  };
}

function emitWalletData(target, data) {
  target.emit('summary', data.summary);
  target.emit('monthlyVolume', data.monthlyVolume);
  target.emit('topCounterparties', data.topCounterparties);
}

async function refreshCache(io) {
  try {
    const latest = getRealtimeWalletData();

    const changed =
      JSON.stringify(latest) !== JSON.stringify(cache);

    if (changed) {
      cache = latest;

      console.log(
        `Data changed -> broadcast cho ${io.engine.clientsCount} client`
      );

      emitWalletData(io, cache);
    } else {
      console.log('Data không đổi -> bỏ qua broadcast');
    }
  } catch (err) {
    console.error(err);
  }

  setTimeout(() => refreshCache(io), BROADCAST_INTERVAL_MS);
}

function setupRealtimeUpdates(io) {
  // load cache lần đầu
  cache = getRealtimeWalletData();

  io.on('connection', (socket) => {
    console.log(
      `Client kết nối: ${socket.id} (${io.engine.clientsCount})`
    );

    // gửi cache luôn
    emitWalletData(socket, cache);

    socket.on('disconnect', () => {
      console.log(
        `Client ngắt kết nối: ${socket.id} (${io.engine.clientsCount})`
      );
    });
  });

  refreshCache(io);
}

module.exports = { setupRealtimeUpdates };