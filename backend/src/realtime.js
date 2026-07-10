const { getWalletTransactions } = require('./dataSourceGgsheet');
const {
  calculateSummary,
  calculateMonthlyVolume,
  calculateVolumeByCounterparty,
  sortTransactionsByTimeDescending,   // THÊM
  attachDirectionLabel,               // THÊM
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

async function setupRealtimeUpdates(io) {
  // load cache lần đầu
  cache = await getRealtimeWalletData();

  io.on('connection', (socket) => {
    console.log(
      `Client kết nối: ${socket.id} (${io.engine.clientsCount})`
    );

    // gửi cache luôn
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
        callback({ error: 'Không lấy được dữ liệu giao dịch' });
      }
    });

    socket.on('disconnect', () => {
      console.log(
        `Client ngắt kết nối: ${socket.id} (${io.engine.clientsCount})`
      );
    });
  });

  refreshCache(io);
}

module.exports = { setupRealtimeUpdates };