const { Pool } = require('pg');
const config = require('./env');

function createDatabase() {
  const pool = new Pool(config.database);
  // PostgreSQL restarts and dropped idle connections emit errors outside a query.
  // The pool removes the failed client and reconnects on subsequent requests.
  pool.on('error', error => {
    console.error('Idle database connection failed:', error.code || error.name);
  });
  return pool;
}

module.exports = { createDatabase };
