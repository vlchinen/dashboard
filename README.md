# Wallet Transactions Dashboard (learning project)

A small project I built to understand how a frontend and backend actually talk to each other — how data flows from a source, through backend aggregation, out to the client, and how a REST API differs from a WebSocket connection in practice. The use case (an ETH wallet transactions dashboard, backed by a Google Sheet) is just a vehicle for that; it's not meant to be a polished product or a demonstration of "full-stack" breadth.

## What it does
- Backend reads wallet transaction rows from a Google Sheet and aggregates them (monthly volume, top counterparties, summary stats, paginated transaction list)
- Stat cards and charts update in near-realtime: the backend pushes data over a WebSocket (Socket.IO) whenever it changes, instead of the frontend polling on a timer
- The transaction table still requests its data on demand (page by page) over the same WebSocket connection, using an ack/callback — a REST-style request/response, just carried over a persistent socket instead of a new HTTP call each time

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

## Code layout
- `backend/src/dataSourceGgsheet.js` — reads the source data (currently Google Sheets; `dataSourceExcel.js` is kept as a reference for the earlier Excel-based version)
- `backend/src/aggregate.js` — computes/aggregates data for the dashboard
- `backend/src/routes/wallet.js` — REST API endpoints (`/api/wallet/*`)
- `backend/src/realtime.js` — Socket.IO: broadcasts data on change, and answers paginated transaction requests
- `frontend/src/api/walletApi.js` — REST API calls
- `frontend/src/hooks/useWalletSocket.js` — shared WebSocket connection + realtime data hook
- `frontend/src/components/` — each chart/table/stat-card is its own component
