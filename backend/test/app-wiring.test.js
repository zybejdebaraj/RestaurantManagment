const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');

const secret = 'app-wiring-test-only-secret';
const owner = { id: 7, name: 'Owner', email: 'owner@example.invalid', role: 'owner' };
const token = jwt.sign({ id: owner.id }, secret, { expiresIn: '1h' });

async function serve(t, query, jwtSecret = secret) {
  const server = createApp({ db: { query }, jwtSecret }).listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, 'listening');
  return async (url, { auth, ...options } = {}) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${url}`, {
      ...options,
      headers: { ...(auth ? { Authorization: `Bearer ${auth}` } : {}), ...options.headers },
    });
    return { status: response.status, body: await response.json() };
  };
}

test('public discovery and unknown routes do not require authentication', async t => {
  let queries = 0;
  const request = await serve(t, async () => { queries++; return { rows: [] }; });
  assert.deepEqual(await request('/'), { status: 200, body: { message: 'Restaurant API is running' } });
  assert.deepEqual(await request('/missing'), { status: 404, body: { error: 'Route not found' } });
  assert.equal(queries, 0);
  for (const url of ['/restaurant', '/menus']) {
    assert.deepEqual(await request(url), { status: 200, body: [] });
  }
  assert.equal(queries, 2);
});

test('every protected route rejects anonymous callers before accessing the database', async t => {
  const request = await serve(t, async () => assert.fail('Anonymous request reached the database'));
  const cases = [
    ['GET', '/auth/me'], ['GET', '/restaurant?mine=1'], ['GET', '/menus?mine=1'],
    ['POST', '/restaurant'], ['PUT', '/restaurant/1'], ['DELETE', '/restaurant/1'],
    ['POST', '/menus'], ['PUT', '/menus/1'], ['DELETE', '/menus/1'], ['POST', '/reviews'],
  ];
  for (const [method, url] of cases) {
    const options = { method };
    if (['POST', 'PUT'].includes(method)) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = '{}';
    }
    assert.deepEqual(await request(url, options), { status: 401, body: { error: 'Please sign in' } }, `${method} ${url}`);
  }
});

test('authentication rejects invalid and expired tokens without querying users', async t => {
  const request = await serve(t, async () => assert.fail('Invalid token reached the database'));
  const tokens = [
    'broken-token',
    jwt.sign({ id: 7 }, 'different-secret'),
    jwt.sign({ id: 7 }, secret, { expiresIn: -1 }),
    jwt.sign({ id: 7 }, secret, { algorithm: 'HS384' }),
  ];
  for (const auth of tokens) {
    const response = await request('/auth/me', { auth });
    assert.equal(response.status, 401);
    assert.match(response.body.error, /sign in again/i);
  }
});

test('authenticated identity comes from the injected database and excludes private fields', async t => {
  const request = await serve(t, async (sql, values) => {
    assert.deepEqual(values, [7]);
    return { rows: [{ ...owner, password: 'private-hash' }] };
  });
  assert.deepEqual(await request('/auth/me', { auth: token }), { status: 200, body: owner });
});

test('tokens for deleted users cannot access owner lists', async t => {
  let queries = 0;
  const request = await serve(t, async () => { queries++; return { rows: [] }; });
  for (const url of ['/restaurant?mine=1', '/menus?mine=1']) {
    assert.deepEqual(await request(url, { auth: token }), { status: 401, body: { error: 'Please sign in again' } });
  }
  assert.equal(queries, 2, 'Only authentication queries should run');
});

test('nested menu route retains its precedence over the menu ID route', async t => {
  let queries = 0;
  const request = await serve(t, async (sql, values) => {
    queries++;
    assert.deepEqual(values, ['12']);
    return { rows: queries === 1 ? [{ id: 12 }] : [{ id: 4, restaurant_id: 12, price: '9.50' }] };
  });
  assert.deepEqual(await request('/menus/restaurant/12'), {
    status: 200, body: [{ id: 4, restaurant_id: 12, price: 9.5 }],
  });
  assert.equal(queries, 2);
});

test('controller database errors reach shared middleware with their HTTP status', async t => {
  let code = '23505';
  const request = await serve(t, async () => { throw Object.assign(new Error('database detail'), { code }); });
  assert.deepEqual(await request('/restaurant'), { status: 409, body: { error: 'This email is already registered' } });
  code = '23503';
  assert.deepEqual(await request('/menus'), { status: 400, body: { error: 'The linked record does not exist or is still in use' } });
});

test('app instances keep their database, signing secret, and rate limits independent', async t => {
  const requestA = await serve(t, async () => ({ rows: [owner] }));
  const other = { ...owner, name: 'Another app' };
  const otherSecret = 'another-app-test-secret';
  const otherToken = jwt.sign({ id: owner.id }, otherSecret, { expiresIn: '1h' });
  const requestB = await serve(t, async () => ({ rows: [other] }), otherSecret);
  assert.deepEqual((await requestA('/auth/me', { auth: token })).body, owner);
  assert.deepEqual((await requestB('/auth/me', { auth: otherToken })).body, other);
  assert.equal((await requestB('/auth/me', { auth: token })).status, 401);
  assert.equal((await requestA('/auth/me', { auth: otherToken })).status, 401);
  // Each instance also needs its own limiter store rather than a shared counter.
  for (let attempt = 0; attempt < 30; attempt++) {
    assert.equal((await requestA('/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    })).status, 400);
  }
  assert.equal((await requestA('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 429);
  assert.equal((await requestB('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 400);
});
