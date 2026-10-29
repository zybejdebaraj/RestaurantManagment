const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const { createApp } = require('../app');
const config = require('../config');

test('PostgreSQL restaurant and menu workflow', async (t) => {
  assert(['localhost', '127.0.0.1', '::1'].includes(config.database.host), 'Tests require local PostgreSQL');
  assert.equal(config.database.database, 'restaurant_management', 'Tests must use the restaurant database');
  const db = new Pool(config.database);
  await db.query(fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8'));
  const server = createApp({ db, jwtSecret: config.jwtSecret, origins: config.origins }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.on('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const run = crypto.randomBytes(5).toString('hex');
  const owners = {}, ids = [];
  async function request(actor, method, url, body, expected = 200) {
    const headers = { 'Content-Type': 'application/json', Origin: 'http://localhost:8082' };
    if (actor) headers.Authorization = `Bearer ${owners[actor].token}`;
    const response = await fetch(base + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:8082');
    const data = await response.json();
    assert.equal(response.status, expected, `${method} ${url}: ${JSON.stringify(data.error || '')}`);
    return data;
  }
  let restaurant, otherRestaurant, menu;
  const details = { name: `QA Restaurant ${run}`, address: 'QA address', contact: 'QA contact' };
  const menuBody = () => ({ restaurant_id: restaurant.id, name: 'QA meal', price: 12.50, description: 'QA description', category: 'Main Course' });
  try {
    await t.test('registration preflight allows frontend port 8082 and excludes unrelated origins', async () => {
      for (const origin of ['http://localhost:8082', 'https://unrelated.example.invalid']) {
        const response = await fetch(base + '/users', { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
        if (origin === 'http://localhost:8082') {
          assert.equal(response.status, 204);
          assert.equal(response.headers.get('access-control-allow-origin'), origin);
          assert.match(response.headers.get('access-control-allow-methods'), /POST/);
          assert.match(response.headers.get('access-control-allow-headers'), /content-type/i);
        } else assert.equal(response.headers.get('access-control-allow-origin'), null);
      }
    });
    await t.test('database readiness', () => request(null, 'GET', '/health'));
    await t.test('missing and malformed request bodies receive client errors', async () => {
      for (const endpoint of ['/users', '/auth/login']) {
        await request(null, 'POST', endpoint, null, 400);
        const malformed = await fetch(base + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' });
        assert.equal(malformed.status, 400);
        assert.equal((await malformed.json()).error, 'Invalid JSON body');
        await request(null, 'POST', endpoint, [], 400);
      }
    });
    await t.test('oversized JSON reports an upload error instead of a server error', async () => {
      const response = await fetch(base + '/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: 'x'.repeat(8 * 1024 * 1024) }) });
      assert.equal(response.status, 413);
      assert.match((await response.json()).error, /too large/i);
    });
    await t.test('register two isolated owners without exposing password hashes', async () => {
      for (const name of ['one', 'two']) {
        const email = `qa.${run}.${name}@example.invalid`, password = `QA-${crypto.randomBytes(9).toString('hex')}!`;
        owners[name] = await request(null, 'POST', '/users', { name: `QA ${name}`, email, password, role: 'admin' }, 201);
        ids.push(owners[name].id);
        assert.equal(owners[name].role, 'owner');
        assert.equal(owners[name].password, undefined);
        const row = (await db.query('SELECT password FROM users WHERE id=$1', [owners[name].id])).rows[0];
        assert.match(row.password, /^\$2/);
        assert.notEqual(row.password, password);
        owners[name].inputPassword = password;
      }
    });
    await t.test('duplicate email returns conflict', () => request(null, 'POST', '/users', { name: 'Duplicate', email: owners.one.email, password: 'QA-password!' }, 409));
    await t.test('login sends credentials in POST and returns a token', async () => {
      const user = await request(null, 'POST', '/auth/login', { email: owners.one.email, password: owners.one.inputPassword });
      assert(user.token); assert.equal(user.password, undefined);
    });
    await t.test('invalid password is rejected', () => request(null, 'POST', '/auth/login', { email: owners.one.email, password: 'incorrect' }, 401));
    await t.test('old password-in-URL endpoint is disabled', () => request(null, 'GET', '/users', null, 405));
    await t.test('unauthenticated management is rejected', () => request(null, 'POST', '/restaurant', details, 401));
    await t.test('owner creates a restaurant with its own identity', async () => {
      restaurant = await request('one', 'POST', '/restaurant', { ...details, owner_id: owners.two.id }, 201);
      assert.equal(restaurant.owner_id, owners.one.id);
      otherRestaurant = await request('two', 'POST', '/restaurant', { ...details, name: `QA other ${run}` }, 201);
    });
    await t.test('public restaurant browsing works without login', async () => assert((await request(null, 'GET', '/restaurant')).some((r) => r.id === restaurant.id)));
    await t.test('management list contains only owned restaurants', async () => {
      const list = await request('one', 'GET', '/restaurant?mine=1');
      assert(list.some((r) => r.id === restaurant.id)); assert(!list.some((r) => r.id === otherRestaurant.id));
    });
    await t.test('owner can update restaurant fields', async () => {
      const updated = await request('one', 'PUT', `/restaurant/${restaurant.id}`, { ...details, name: details.name + ' edited' });
      assert.equal(updated.name, details.name + ' edited');
    });
    await t.test('another owner cannot update or delete this restaurant', async () => {
      await request('two', 'PUT', `/restaurant/${restaurant.id}`, details, 403);
      await request('two', 'DELETE', `/restaurant/${restaurant.id}`, null, 403);
    });
    await t.test('empty restaurant fields are rejected', () => request('one', 'POST', '/restaurant', { ...details, name: ' ' }, 400));
    await t.test('owner creates a menu item', async () => { menu = await request('one', 'POST', '/menus', menuBody(), 201); assert.equal(menu.price, 12.5); });
    await t.test('uploaded PNG images persist without executing SVG data', async () => {
      const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
      const created = await request('one', 'POST', '/menus', { ...menuBody(), name: 'QA image', image }, 201);
      assert.equal(created.image, image);
      const rejected = await request('one', 'PUT', `/menus/${created.id}`, { image: 'data:image/svg+xml;base64,PHN2Zz4=' });
      assert.equal(rejected.image, '/images/menu-placeholder.svg');
      await request('one', 'DELETE', `/menus/${created.id}`);
    });
    await t.test('public menu reads return numeric prices', async () => {
      const list = await request(null, 'GET', `/menus/restaurant/${restaurant.id}`);
      assert.equal(list[0].id, menu.id); assert.equal(typeof list[0].price, 'number');
    });
    await t.test('negative and invalid prices are rejected', async () => {
      for (const price of [-1, '', 'invalid']) await request('one', 'POST', '/menus', { ...menuBody(), price }, 400);
    });
    await t.test('array identifiers and boolean review ratings are rejected', async () => {
      await request('one', 'POST', '/menus', { ...menuBody(), restaurant_id: [restaurant.id] }, 400);
      await request('two', 'POST', '/reviews', { restaurantId: [restaurant.id], rating: 5 }, 400);
      await request('two', 'POST', '/reviews', { restaurantId: restaurant.id, rating: true }, 400);
    });
    await t.test('free menu items are supported', async () => { const free = await request('one', 'POST', '/menus', { ...menuBody(), name: 'QA free', price: 0 }, 201); assert.equal(free.price, 0); });
    await t.test('owner updates menu details', async () => { const updated = await request('one', 'PUT', `/menus/${menu.id}`, { name: 'QA meal updated', price: 15 }); assert.equal(updated.price, 15); assert.equal(updated.category, 'Main Course'); });
    await t.test('cross-owner menu create, update and delete are rejected', async () => {
      await request('two', 'POST', '/menus', menuBody(), 403);
      await request('two', 'PUT', `/menus/${menu.id}`, { name: 'Forbidden' }, 403);
      await request('two', 'DELETE', `/menus/${menu.id}`, null, 403);
    });
    await t.test('menu cannot be moved to another owner restaurant', () => request('one', 'PUT', `/menus/${menu.id}`, { restaurant_id: otherRestaurant.id }, 403));
    await t.test('mine menu list is isolated', async () => assert(!(await request('two', 'GET', '/menus?mine=1')).some((m) => m.id === menu.id)));
    await t.test('invalid and missing IDs receive clear errors', async () => {
      await request(null, 'GET', '/restaurant/invalid', null, 400);
      await request(null, 'GET', '/restaurant/9999999999999999', null, 400);
      await request(null, 'GET', '/menus/2147483647', null, 404);
    });
    await t.test('reviews use the authenticated user, not client-supplied identity', async () => {
      const review = await request('two', 'POST', '/reviews', { restaurantId: restaurant.id, userId: owners.one.id, rating: 5, text: 'QA review' }, 201);
      assert.equal(review.user_id, owners.two.id);
      const item = (await request(null, 'GET', '/restaurant')).find((r) => r.id === restaurant.id);
      assert.equal(item.rating, 5); assert.equal(item.reviewCount, 1);
    });
    await t.test('review rating validation', () => request('two', 'POST', '/reviews', { restaurantId: restaurant.id, rating: 9 }, 400));
    await t.test('owner can delete a menu and delete restaurant with remaining items', async () => {
      await request('one', 'DELETE', `/menus/${menu.id}`);
      await request('one', 'DELETE', `/restaurant/${restaurant.id}`);
      await request(null, 'GET', `/restaurant/${restaurant.id}`, null, 404);
      assert.equal((await db.query('SELECT COUNT(*)::int AS count FROM menus WHERE restaurant_id=$1', [restaurant.id])).rows[0].count, 0);
    });
  } finally {
    await db.query('DELETE FROM restaurants WHERE owner_id = ANY($1::int[])', [ids]);
    await db.query('DELETE FROM reviews WHERE user_id = ANY($1::int[])', [ids]);
    await db.query('DELETE FROM users WHERE id = ANY($1::int[])', [ids]);
    await new Promise((resolve) => server.close(resolve));
    await db.end();
  }
});


test('sign-in rate limits return a readable JSON error', async () => {
  const db = { query: async () => ({ rows: [] }) };
  const server = createApp({ db, jwtSecret: 'test-only-rate-limit-secret' }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.on('listening', resolve));
  try {
    for (let attempt = 1; attempt <= 31; attempt++) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'qa.rate@example.invalid', password: 'incorrect' }) });
      const data = await response.json();
      assert.equal(response.status, attempt <= 30 ? 401 : 429);
      if (attempt === 31) assert.match(data.error, /15 minutes/);
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
});
