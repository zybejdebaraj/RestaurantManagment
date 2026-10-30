const { createDatabase } = require('./config/db');
const { ensureSchema } = require('./utils/ensureSchema');
const config = require('./config/env');
const { createApp } = require('./app');

async function start() {
  const db = createDatabase();
  try {
    await db.query('SELECT 1');
    await ensureSchema(db);
    const app = createApp({ db, jwtSecret: config.jwtSecret, origins: config.origins });
    const server = app.listen(config.port, () => console.log(`Restaurant API running on port ${config.port} (PostgreSQL)`));
    server.on('error', async (error) => {
      console.error('Server startup failed:', error.code);
      await db.end();
      process.exitCode = 1;
    });
    const stop = () => server.close(() => db.end().finally(() => process.exit(0)));
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
  } catch (error) {
    console.error('Database startup failed:', error.code || error.message);
    await db.end();
    process.exitCode = 1;
  }
}
start();
