const { getWalletTransactions } = require('./dataSourceGgsheet');
const {
  calculateSummary,
  calculateMonthlyVolume,
  calculateVolumeByCounterparty,
  sortTransactionsByTimeDescending,
  attachDirectionLabel,
  paginate,
} = require('./aggregate');

const BROADCAST_INTERVAL_MS = 30000;

let cache = null;

async function getRealtimeWalletData() {
  const rows = await getWalletTransactions();

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
    const latest = await getRealtimeWalletData();

    const changed =
      JSON.stringify(latest) !== JSON.stringify(cache);

    if (changed) {
      cache = latest;

      console.log(
        `Data changed -> broadcasting to ${io.engine.clientsCount} client(s)`
      );

      emitWalletData(io, cache);
    } else {
      console.log('Data unchanged -> skipping broadcast');
    }
  } catch (err) {
    console.error(err);
  }

  setTimeout(() => refreshCache(io), BROADCAST_INTERVAL_MS);
}

async function setupRealtimeUpdates(io) {
  // load the initial cache
  cache = await getRealtimeWalletData();

  io.on('connection', (socket) => {
    console.log(
      `Client connected: ${socket.id} (${io.engine.clientsCount})`
    );

    // send the cached data right away
    emitWalletData(socket, cache);

    socket.on('getTransactions', async ({ page, pageSize }, callback) => {
      try {
        const rows = await getWalletTransactions();
        const sortedRows = sortTransactionsByTimeDescending(rows);
        const labeledRows = attachDirectionLabel(sortedRows);
        const pagedRows = paginate(labeledRows, page, pageSize);

        callback({
          rows: pagedRows,
          total: rows.length,
          page,
          pageSize,
        });
      } catch (err) {
        console.error(err);
        callback({ error: 'Failed to fetch transaction data' });
      }
    });

    socket.on('disconnect', () => {
      console.log(
        `Client disconnected: ${socket.id} (${io.engine.clientsCount})`
      );
    });
  });

  refreshCache(io);
}

module.exports = { setupRealtimeUpdates };