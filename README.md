# Dashboard

A near-realtime web dashboard for on-chain (ETH) wallet transactions: data table + transaction volume charts.

## Setup

### Backend
```
cd backend
npm install
cp .env.example .env   # then fill in your WALLET_ADDRESS, Google Sheets ID, and credentials path
```
Data is read from a Google Sheet (columns: Hash, Block, Time, From, To, ETH, GasUsed, GasPrice, Status) via a Google service account — see `.env.example` for the required variables.

```
npm run dev   # http://localhost:4000
```

### Frontend
```
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Architecture
- `backend/src/dataSourceGgsheet.js` — reads the source data (currently Google Sheets; `dataSourceExcel.js` is kept as a reference for the earlier Excel-based version)
- `backend/src/aggregate.js` — computes/aggregates data for the dashboard
- `backend/src/routes/wallet.js` — REST API endpoints (`/api/wallet/*`)
- `backend/src/realtime.js` — Socket.IO: broadcasts data on change, and answers paginated transaction requests
- `frontend/src/api/walletApi.js` — REST API calls
- `frontend/src/hooks/useWalletSocket.js` — shared WebSocket connection + realtime data hook
- `frontend/src/components/` — each chart/table/stat-card is its own component
