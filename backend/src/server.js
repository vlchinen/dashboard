require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const walletRouter = require('./routes/wallet');
const { setupRealtimeUpdates } = require('./realtime');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use('/api/wallet', walletRouter);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173' },
});

setupRealtimeUpdates(io); 

httpServer.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});