import { app } from './app.js';
import { connectDatabase } from './config/db.js';
import { ensureDefaultAdmin } from './controllers/authController.js';

const PORT = process.env.PORT || 10000;

const startServer = async () => {
  const isDatabaseConnected = await connectDatabase();

  if (isDatabaseConnected) {
    await ensureDefaultAdmin();
  }

  const server = app.listen(PORT, () => {
    console.log(`SkyCastBD API running on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Closing server...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((error) => {
  console.error('Failed to start SkyCastBD API:', error);
  process.exit(1);
});
