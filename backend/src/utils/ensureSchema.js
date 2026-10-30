const fs = require('node:fs');
const path = require('node:path');

async function ensureSchema(db) {
  await db.query(fs.readFileSync(path.join(__dirname, '../../schema.sql'), 'utf8'));
}

module.exports = { ensureSchema };
