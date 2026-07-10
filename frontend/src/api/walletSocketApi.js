import { socket } from '../hooks/useWalletSocket';

export function fetchTransactionsViaSocket(page, pageSize) {
  return new Promise((resolve) => {
    socket.emit('getTransactions', { page, pageSize }, resolve);
  });
}