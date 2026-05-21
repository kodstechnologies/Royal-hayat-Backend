import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Royal Hayatt server running on http://localhost:${PORT}`);
  });
});
