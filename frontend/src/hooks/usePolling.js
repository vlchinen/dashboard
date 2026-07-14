import { useEffect, useState } from 'react';

// Calls fetchFn immediately, then repeats every intervalMs so the data stays
// near-realtime. deps works like useEffect's deps: changing them restarts the
// polling loop (useful when fetchFn depends on a parameter, e.g. the current page).
export function usePolling(fetchFn, intervalMs, deps = []) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      const result = await fetchFn();
      if (!isCancelled) {
        setData(result);
      }
    }

    loadData();
    const intervalId = setInterval(loadData, intervalMs);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}
