const { Pool } = require('pg');
const config = require('./env');

function createDatabase() {
  return new Pool(config.database);
}

module.exports = { createDatabase };
