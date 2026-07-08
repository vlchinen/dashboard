# Dashboard

Web dashboard hiển thị dữ liệu giao dịch ví on-chain (ETH) gần-realtime: bảng dữ liệu + biểu đồ khối lượng giao dịch.

## Setup

### Backend
```
cd backend
npm install
cp .env.example .env   # rồi điền WALLET_ADDRESS của bạn vào .env
```
Đặt file Excel dữ liệu giao dịch của bạn vào `backend/data/` (cột: Hash, Block, Time, From, To, ETH, GasUsed, GasPrice, Status), sửa tên file trong `backend/src/dataSource.js` nếu cần.

```
npm run dev   # http://localhost:4000
```

### Frontend
```
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Kiến trúc
- `backend/src/dataSource.js` — đọc dữ liệu nguồn (hiện tại: Excel; sau này: Google Sheets)
- `backend/src/aggregate.js` — tính toán/tổng hợp dữ liệu cho dashboard
- `backend/src/routes/wallet.js` — API endpoints (`/api/wallet/*`)
- `frontend/src/api/walletApi.js` — gọi API backend
- `frontend/src/hooks/usePolling.js` — polling dữ liệu định kỳ (sau này thay bằng WebSocket)
- `frontend/src/components/` — mỗi chart/bảng/stat-card là 1 component riêng

Chi tiết đầy đủ: xem [CLAUDE.md](CLAUDE.md).
