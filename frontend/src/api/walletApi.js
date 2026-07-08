const API_BASE_URL = 'http://localhost:4000/api/wallet';

// Mỗi hàm ở đây chỉ làm một việc: gọi đúng một endpoint và trả về JSON.

export async function fetchSummary() {
  const response = await fetch(`${API_BASE_URL}/summary`);
  return response.json();
}

export async function fetchMonthlyVolume() {
  const response = await fetch(`${API_BASE_URL}/monthly-volume`);
  return response.json();
}

export async function fetchTopCounterparties() {
  const response = await fetch(`${API_BASE_URL}/top-counterparties`);
  return response.json();
}

export async function fetchTransactions(page, pageSize) {
  const response = await fetch(`${API_BASE_URL}/transactions?page=${page}&pageSize=${pageSize}`);
  return response.json();
}
