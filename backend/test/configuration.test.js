const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { ensureSchema } = require('../src/utils/ensureSchema');

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'restaurant-config-test-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith('restaurant-config-test-'));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(directory, 'src/config'), { recursive: true });
  fs.mkdirSync(path.join(directory, 'unrelated-cwd'));
  fs.copyFileSync(path.join(__dirname, '../src/config/env.js'), path.join(directory, 'src/config/env.js'));
  const env = { ...process.env, NODE_PATH: path.join(__dirname, '../node_modules') };
  for (const name of ['JWT_SECRET', 'PORT', 'FRONTEND_URL', 'DATABASE_URL', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) delete env[name];
  return {
    directory,
    load(overrides = {}) {
      return spawnSync(process.execPath, ['-e', 'process.stdout.write(JSON.stringify(require(process.argv[1])))', path.join(directory, 'src/config/env.js')], {
        cwd: path.join(directory, 'unrelated-cwd'), env: { ...env, ...overrides }, encoding: 'utf8', timeout: 10000,
      });
    },
  };
}

test('relocated configuration loads backend root env files from an unrelated working directory', t => {
  const { directory, load } = fixture(t);
  fs.writeFileSync(path.join(directory, '.env'), 'JWT_SECRET=base-test-secret\nPORT=3010\nDB_PORT=5432\nDB_NAME=fixture_database\n');
  fs.writeFileSync(path.join(directory, '.env.local'), 'JWT_SECRET=local-test-secret\nPORT=3020\nFRONTEND_URL=http://localhost:8082/, https://frontend.example/\n');
  const result = load();
  assert.equal(result.status, 0, result.stderr);
  const config = JSON.parse(result.stdout);
  assert.equal(config.jwtSecret, 'local-test-secret');
  assert.equal(config.port, 3020);
  assert.equal(config.database.database, 'fixture_database');
  assert.equal(config.database.port, 5432);
  assert.deepEqual(config.origins, ['http://localhost:8082', 'https://frontend.example']);
  const overridden = load({ JWT_SECRET: 'deployment-test-secret', PORT: '3030', DATABASE_URL: 'postgres://test:test@localhost/fixture' });
  assert.equal(overridden.status, 0, overridden.stderr);
  const deployed = JSON.parse(overridden.stdout);
  assert.equal(deployed.jwtSecret, 'deployment-test-secret');
  assert.equal(deployed.port, 3030);
  assert.deepEqual(deployed.database, { connectionString: 'postgres://test:test@localhost/fixture' });
});

test('configuration fails clearly for missing secrets and invalid ports', t => {
  const { load } = fixture(t);
  const missing = load();
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /Set JWT_SECRET/);
  for (const name of ['PORT', 'DB_PORT']) {
    for (const value of ['0', '65536', 'not-a-port', '3.5']) {
      const result = load({ JWT_SECRET: 'test-secret', [name]: value });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, new RegExp(`${name} must be a valid port number`));
    }
  }
});

test('schema helper resolves the backend schema independently of the working directory', t => {
  const { directory } = fixture(t);
  const result = spawnSync(process.execPath, ['-e', `
    const { ensureSchema } = require(process.argv[1]);
    ensureSchema({ query: async sql => process.stdout.write(sql) }).catch(() => { process.exitCode = 1; });
  `, path.join(__dirname, '../src/utils/ensureSchema.js')], { cwd: directory, encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8'));
});

test('schema failures propagate so startup cannot silently accept a broken database', async () => {
  const failure = new Error('Schema application failed');
  await assert.rejects(ensureSchema({ query: async () => { throw failure; } }), error => error === failure);
});

test('idle database connection failures are handled without crashing or exposing credentials', t => {
  const { directory } = fixture(t);
  const result = spawnSync(process.execPath, ['-e', `
    const assert = require('node:assert/strict');
    const { createDatabase } = require(process.argv[1]);
    const pool = createDatabase();
    const messages = [];
    console.error = (...parts) => messages.push(parts.join(' '));
    assert.doesNotThrow(() => pool.emit('error', Object.assign(new Error('sensitive connection detail'), { code: '57P01' })));
    assert(messages.some(message => message.includes('57P01')));
    assert(messages.every(message => !message.includes('sensitive connection detail')));
    pool.end();
  `, path.join(__dirname, '../src/config/db.js')], { cwd: directory, env: { ...process.env, JWT_SECRET: 'pool-test-secret' }, encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 0, result.stderr);
});
