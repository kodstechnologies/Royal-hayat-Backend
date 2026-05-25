import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import seedAdmins from './scripts/seedAdmins.js';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {

    // Run Admin Seeder
    await seedAdmins();

    const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
      console.log(`Royal Hayatt server running on http://localhost:${PORT}`);
    console.log('[identity][boot] PORT=', PORT);
    console.log('[identity][boot] SHARPER_CALLBACK_URL=', process.env.SHARPER_CALLBACK_URL || '(not set)');
    console.log('[identity][boot] Sharper will POST callback to URL above (must reach this process)');
    console.log('[identity][boot] Routes: POST /api/callback | POST /api/v1/identity/start | socket /api/socket.io');
    console.log('[identity][boot] View logs: pm2 logs backend --lines 200');
    });

  })
  .catch((error) => {
    console.error('DB Connection Failed:', error.message);
  });