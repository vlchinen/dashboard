import { useEffect, useState } from 'react';

// Gọi fetchFn ngay lập tức, sau đó lặp lại mỗi intervalMs để dữ liệu
// luôn cập nhật gần-realtime. deps giống deps của useEffect: đổi deps
// sẽ khởi động lại vòng lặp polling (dùng khi fetchFn phụ thuộc tham số, vd trang hiện tại).
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
