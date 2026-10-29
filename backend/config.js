const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

function port(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error(`${name} must be a valid port number`);
  return value;
}
if (!process.env.JWT_SECRET) throw new Error('Set JWT_SECRET in backend/.env.local or your deployment environment');

module.exports = {
  port: port('PORT', 3001),
  jwtSecret: process.env.JWT_SECRET,
  origins: (process.env.FRONTEND_URL || 'http://localhost:8080,http://localhost:8081,http://localhost:8082').split(',').map((origin) => origin.trim().replace(/\/$/, '')),
  database: process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL }
    : { host: process.env.DB_HOST || 'localhost', port: port('DB_PORT', 5432),
      user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'restaurant_management', connectionTimeoutMillis: 5000 },
};
