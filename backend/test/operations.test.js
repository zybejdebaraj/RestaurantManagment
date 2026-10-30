const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const config = require('../src/config/env');
const { createApp } = require('../src/app');
const { ensureSchema } = require('../src/utils/ensureSchema');
const { transaction } = require('../src/utils/operations');

test('transactions roll back and release their client on failure', async () => {
  const calls = [];
  const failure = new Error('write failed');
  const client = { query: async sql => calls.push(sql), release: () => calls.push('release') };
  await assert.rejects(transaction({ connect: async () => client }, async () => { throw failure; }), error => error === failure);
  assert.deepEqual(calls, ['BEGIN', 'ROLLBACK', 'release']);
});

test('PostgreSQL order and table management', async t => {
  assert(['localhost', '127.0.0.1', '::1'].includes(config.database.host), 'Tests require local PostgreSQL');
  assert.equal(config.database.database, 'restaurant_management', 'Tests must use the restaurant database');
  const db = new Pool(config.database);
  const users = [];
  let server;
  t.after(async () => {
    try {
      await db.query('DELETE FROM restaurants WHERE owner_id=ANY($1::int[])', [users]);
      await db.query('DELETE FROM users WHERE id=ANY($1::int[])', [users]);
    } finally {
      if (server) {
        const closed = new Promise(resolve => server.close(resolve));
        server.closeAllConnections();
        await closed;
      }
      await db.end();
    }
  });
  await ensureSchema(db);
  const run = crypto.randomBytes(6).toString('hex');
  for (const name of ['one', 'two']) {
    users.push((await db.query("INSERT INTO users(name,email,password,role) VALUES($1,$2,'test-unused','owner') RETURNING id", [name, `ops.${run}.${name}@example.invalid`])).rows[0].id);
  }
  const tokens = users.map(id => jwt.sign({ id }, config.jwtSecret, { expiresIn: '1h' }));
  const restaurants = [];
  for (const owner of users) restaurants.push((await db.query("INSERT INTO restaurants(name,address,contact,owner_id) VALUES('Operations QA','Test','Test',$1) RETURNING id", [owner])).rows[0].id);
  const restaurantId = restaurants[0];
  const menu = (await db.query("INSERT INTO menus(restaurant_id,name,price) VALUES($1,'Test dish',0.10) RETURNING id", [restaurantId])).rows[0].id;
  const otherMenu = (await db.query("INSERT INTO menus(restaurant_id,name,price) VALUES($1,'Other dish',20) RETURNING id", [restaurants[1]])).rows[0].id;
  server = createApp({ db, jwtSecret: config.jwtSecret }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  async function request(actor, method, url, body, expected = 200) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${url}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(actor === null ? {} : { Authorization: `Bearer ${tokens[actor]}` }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json();
    assert.equal(response.status, expected, `${method} ${url}: ${JSON.stringify(data)}`);
    return data;
  }
  let counter = 0;
  const table = (capacity = 4) => request(0, 'POST', '/tables', { restaurant_id: restaurantId, name: `QA ${++counter}`, capacity }, 201);
  const body = (tableId = null) => ({ restaurant_id: restaurantId, table_id: tableId, guests: 2, items: [{ menu_id: menu, quantity: 3 }] });
  const order = tableId => request(0, 'POST', '/orders', body(tableId), 201);
  const status = (id, value, expected = 200) => request(0, 'PATCH', `/orders/${id}/status`, { status: value }, expected);

  await t.test('all order and table endpoints require authentication', async () => {
    for (const [method, url] of [['GET', '/tables'], ['POST', '/tables'], ['PUT', '/tables/1'], ['DELETE', '/tables/1'], ['GET', '/orders'], ['POST', '/orders'], ['PUT', '/orders/1/items'], ['PATCH', '/orders/1/status']]) {
      await request(null, method, url, ['GET', 'DELETE'].includes(method) ? undefined : {}, 401);
    }
  });
  await t.test('tables support creation, listing, editing, unique names, and deletion', async () => {
    const created = await table();
    assert.equal(created.status, 'available');
    await request(0, 'POST', '/tables', { restaurant_id: restaurantId, name: created.name, capacity: 4 }, 409);
    const updated = await request(0, 'PUT', `/tables/${created.id}`, { name: 'Edited QA table', capacity: 6 });
    assert.equal(updated.capacity, 6);
    assert((await request(0, 'GET', `/tables?restaurant_id=${restaurantId}`)).some(item => item.id === created.id && item.name === updated.name));
    await request(0, 'DELETE', `/tables/${created.id}`);
    await request(0, 'PUT', `/tables/${created.id}`, { name: 'Missing', capacity: 2 }, 404);
  });
  await t.test('invalid table names, capacities, and identifiers are rejected', async () => {
    for (const fields of [{ name: ' ' }, { name: 'x'.repeat(51) }, { capacity: 0 }, { capacity: 501 }, { capacity: 1.5 }, { capacity: true }]) {
      await request(0, 'POST', '/tables', { restaurant_id: restaurantId, name: 'QA invalid', capacity: 4, ...fields }, 400);
    }
    await request(0, 'GET', '/tables?restaurant_id=invalid', undefined, 400);
    await request(0, 'DELETE', '/tables/invalid', undefined, 400);
  });
  await t.test('owners cannot read or change another restaurant’s tables or orders', async () => {
    const created = await table();
    for (const url of [`/tables?restaurant_id=${restaurantId}`, `/orders?restaurant_id=${restaurantId}`]) await request(1, 'GET', url, undefined, 404);
    await request(1, 'POST', '/tables', { restaurant_id: restaurantId, name: 'Forbidden', capacity: 4 }, 404);
    await request(1, 'PUT', `/tables/${created.id}`, { name: 'Forbidden', capacity: 4 }, 404);
    await request(1, 'DELETE', `/tables/${created.id}`, undefined, 404);
    await request(1, 'POST', '/orders', body(created.id), 404);
    const createdOrder = await order(created.id);
    await request(1, 'PUT', `/orders/${createdOrder.id}/items`, { items: [{ menu_id: menu, quantity: 1 }] }, 404);
    await request(1, 'PATCH', `/orders/${createdOrder.id}/status`, { status: 'cancelled' }, 404);
  });
  await t.test('order totals use database prices and exact decimal arithmetic', async () => {
    const created = await request(0, 'POST', '/orders', { ...body(), total: 0, status: 'completed', items: [{ menu_id: menu, quantity: 3, unit_price: 0, name: 'Fake dish' }] }, 201);
    assert.equal(created.total, 0.3);
    assert.equal(created.status, 'pending');
    assert.equal(created.items[0].name, 'Test dish');
    assert.equal(created.items[0].unit_price, 0.1);
    assert.equal(created.table_id, null);
  });
  await t.test('table capacity and restaurant membership are enforced', async () => {
    const small = await table(1);
    await request(0, 'POST', '/orders', body(small.id), 400);
    const foreignTable = await request(1, 'POST', '/tables', { restaurant_id: restaurants[1], name: 'Other table', capacity: 4 }, 201);
    await request(0, 'POST', '/orders', body(foreignTable.id), 404);
  });
  await t.test('invalid order fields and foreign menu items never leave partial orders', async () => {
    const before = (await db.query('SELECT COUNT(*)::int AS count FROM orders WHERE restaurant_id=$1', [restaurantId])).rows[0].count;
    for (const change of [
      { items: [] }, { items: [{ menu_id: menu, quantity: 0 }] }, { items: [{ menu_id: menu, quantity: 100 }] },
      { items: [{ menu_id: menu, quantity: 1.5 }] }, { items: [{ menu_id: menu, quantity: true }] },
      { items: [{ menu_id: menu, quantity: 1 }, { menu_id: menu, quantity: 1 }] },
      { items: [{ menu_id: otherMenu, quantity: 1 }] }, { guests: 0 }, { notes: 'x'.repeat(2001) }, { table_id: [] },
    ]) await request(0, 'POST', '/orders', { ...body(), ...change }, 400);
    assert.equal((await db.query('SELECT COUNT(*)::int AS count FROM orders WHERE restaurant_id=$1', [restaurantId])).rows[0].count, before);
  });
  await t.test('active orders occupy a table and prevent edits or deletion', async () => {
    const created = await table();
    const placed = await order(created.id);
    const listed = (await request(0, 'GET', `/tables?restaurant_id=${restaurantId}`)).find(item => item.id === created.id);
    assert.equal(listed.status, 'occupied');
    assert.equal(listed.active_order_id, placed.id);
    await request(0, 'POST', '/orders', body(created.id), 409);
    await request(0, 'PUT', `/tables/${created.id}`, { name: 'Occupied', capacity: 2 }, 409);
    await request(0, 'DELETE', `/tables/${created.id}`, undefined, 409);
  });
  await t.test('simultaneous orders cannot occupy the same table', async () => {
    const created = await table();
    const attempts = await Promise.all([1, 2].map(() => fetch(`http://127.0.0.1:${server.address().port}/orders`, {
      method: 'POST', headers: { Authorization: `Bearer ${tokens[0]}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body(created.id)),
    })));
    const results = await Promise.all(attempts.map(async response => { await response.json(); return response.status; }));
    assert.deepEqual(results.sort(), [201, 409]);
  });
  await t.test('pending items can be replaced, but a failed edit restores the original items', async () => {
    const placed = await order();
    const updated = await request(0, 'PUT', `/orders/${placed.id}/items`, { items: [{ menu_id: menu, quantity: 5 }] });
    assert.equal(updated.total, 0.5);
    await request(0, 'PUT', `/orders/${placed.id}/items`, { items: [{ menu_id: otherMenu, quantity: 5 }] }, 400);
    const retained = (await request(0, 'GET', `/orders?restaurant_id=${restaurantId}`)).find(item => item.id === placed.id);
    assert.equal(retained.total, 0.5); assert.equal(retained.items[0].quantity, 5);
    await status(placed.id, 'preparing');
    await request(0, 'PUT', `/orders/${placed.id}/items`, { items: [{ menu_id: menu, quantity: 1 }] }, 409);
  });
  await t.test('status progression is enforced and completion releases the table', async () => {
    const created = await table(); const placed = await order(created.id);
    await status(placed.id, 'completed', 409);
    await status(placed.id, '__proto__', 400);
    await status(placed.id, 'preparing');
    await status(placed.id, 'pending', 409);
    await status(placed.id, 'ready'); await status(placed.id, 'served'); await status(placed.id, 'completed');
    await status(placed.id, 'cancelled', 409);
    assert.equal((await request(0, 'GET', `/tables?restaurant_id=${restaurantId}`)).find(item => item.id === created.id).status, 'available');
    await order(created.id);
  });
  await t.test('malformed status values return client errors without changing the order', async () => {
    const placed = await order();
    for (const value of [{ toString: null }, ['preparing'], null, 1, true, {}]) await status(placed.id, value, 400);
    const unchanged = (await request(0, 'GET', `/orders?restaurant_id=${restaurantId}`)).find(item => item.id === placed.id);
    assert.equal(unchanged.status, 'pending');
  });
  await t.test('cancellation releases tables and preserves order history', async () => {
    const created = await table(); const placed = await order(created.id);
    await status(placed.id, 'cancelled');
    await status(placed.id, 'preparing', 409);
    await request(0, 'DELETE', `/tables/${created.id}`);
    const history = (await request(0, 'GET', `/orders?restaurant_id=${restaurantId}`)).find(item => item.id === placed.id);
    assert.equal(history.status, 'cancelled'); assert.equal(history.table_id, null); assert.equal(history.table_name, created.name);
  });
  await t.test('menu edits and deletion preserve historical item names and prices', async () => {
    const special = (await db.query("INSERT INTO menus(restaurant_id,name,price) VALUES($1,'Snapshot dish',12.50) RETURNING id", [restaurantId])).rows[0].id;
    const placed = await request(0, 'POST', '/orders', { ...body(), items: [{ menu_id: special, quantity: 2 }] }, 201);
    await db.query("UPDATE menus SET name='Changed',price=99 WHERE id=$1", [special]);
    await db.query('DELETE FROM menus WHERE id=$1', [special]);
    const history = (await request(0, 'GET', `/orders?restaurant_id=${restaurantId}`)).find(item => item.id === placed.id);
    assert.equal(history.items[0].name, 'Snapshot dish'); assert.equal(history.items[0].unit_price, 12.5);
    assert.equal(history.items[0].menu_id, null); assert.equal(history.total, 25);
  });
  await t.test('free menu items are supported', async () => {
    const free = (await db.query("INSERT INTO menus(restaurant_id,name,price) VALUES($1,'Free water',0) RETURNING id", [restaurantId])).rows[0].id;
    const placed = await request(0, 'POST', '/orders', { ...body(), items: [{ menu_id: free, quantity: 2 }] }, 201);
    assert.equal(placed.total, 0);
  });
});
