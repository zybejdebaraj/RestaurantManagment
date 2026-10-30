const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const helperSource = fs.readFileSync(path.join(__dirname, '../src/services/orders.js'), 'utf8');
const helpers = import(`data:text/javascript;base64,${Buffer.from(helperSource).toString('base64')}`);

async function componentState(name) {
  const pending = new Map();
  const calls = [];
  const http = Object.fromEntries(['get', 'post', 'put', 'patch', 'delete'].map(method => [method, (url, value) => {
    const key = `${method} ${url}${method === 'get' && value?.params ? `?${value.params.restaurant_id}` : ''}`;
    calls.push({ method, url, value });
    return new Promise((resolve, reject) => pending.set(key, { resolve, reject }));
  }]));
  const source = fs.readFileSync(path.join(__dirname, `../src/components/views/${name}.vue`), 'utf8');
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*;$/gm, '').replace('export default', 'module.exports =');
  const context = { module: { exports: {} }, http, ManagementLayout: {}, ConfirmDialog: {}, AppIcon: {}, window: { scrollTo() {} }, ...(await helpers) };
  vm.runInNewContext(script, context);
  const component = context.module.exports;
  const state = { ...component.data(), restaurantId: '1', $route: { query: {} } };
  Object.entries(component.methods).forEach(([key, method]) => { state[key] = method.bind(state); });
  Object.entries(component.computed).forEach(([key, getter]) => { Object.defineProperty(state, key, { get: () => getter.call(state) }); });
  function resolve(restaurant, data = {}) {
    if (name === 'Orders') {
      pending.get(`get /orders?${restaurant}`).resolve({ data: data.orders || [] });
      pending.get(`get /menus/restaurant/${restaurant}`).resolve({ data: data.menus || [] });
    }
    pending.get(`get /tables?${restaurant}`).resolve({ data: data.tables || [] });
  }
  return { state, pending, calls, resolve };
}

test('order previews use cents, preserve free items, and multiply quantities', async () => {
  const { totalCents, isActive, nextStatus } = await helpers;
  assert.equal(totalCents([{ menu_id: 1, quantity: 3 }, { menu_id: 2, quantity: 2 }], [{ id: 1, price: 0.1 }, { id: 2, price: 0.2 }]), 70);
  assert.equal(totalCents([{ menu_id: 1, quantity: 3, unit_price: 12 }], [{ id: 1, price: 0 }]), 0);
  assert.equal(isActive({ status: 'served' }), true);
  assert.equal(isActive({ status: 'completed' }), false);
  assert.equal(isActive({ status: 'cancelled' }), false);
  assert.equal(nextStatus.served, 'completed');
  assert.equal(nextStatus.completed, undefined);
});

for (const name of ['Tables', 'Orders']) {
  test(`${name}: slow responses cannot replace another restaurant’s data`, async () => {
    const { state, resolve } = await componentState(name);
    const load = name === 'Tables' ? state.loadTables : state.loadOrders;
    const old = load(); state.restaurantId = '2'; const current = load();
    resolve('2', { tables: [{ id: 20, status: 'available' }], orders: [{ id: 20 }], menus: [{ id: 20 }] }); await current;
    resolve('1', { tables: [{ id: 10 }], orders: [{ id: 10 }], menus: [{ id: 10 }] }); await old;
    assert.equal(state.tables[0].id, 20); assert.equal(state.loading, false);
    if (name === 'Orders') { assert.equal(state.orders[0].id, 20); assert.equal(state.menus[0].id, 20); }
  });
  test(`${name}: a stale failure cannot hide a successful restaurant switch`, async () => {
    const { state, resolve, pending } = await componentState(name);
    const load = name === 'Tables' ? state.loadTables : state.loadOrders;
    const old = load(); state.restaurantId = '2'; const current = load();
    resolve('2', { tables: [{ id: 20 }] }); await current;
    pending.get('get /tables?1').reject(new Error('Old failure'));
    if (name === 'Orders') {
      pending.get('get /orders?1').resolve({ data: [] });
      pending.get('get /menus/restaurant/1').resolve({ data: [] });
    }
    await old;
    assert.equal(state.error, ''); assert.equal(state.tables[0].id, 20);
  });
}

test('editing an order copies its items and preserves the original displayed order', async () => {
  const { state } = await componentState('Orders');
  const order = { id: 5, table_id: 1, guests: 2, notes: '', items: [{ menu_id: 2, quantity: 3 }] };
  state.edit(order); state.draft.items[0].quantity = 5;
  assert.equal(order.items[0].quantity, 3);
  state.reset(); assert.equal(state.draft.items.length, 0); assert.equal(state.editing, null);
});

test('adding the same dish increments its quantity rather than creating duplicate lines', async () => {
  const { state } = await componentState('Orders');
  state.menuId = '2'; state.addItem(); state.menuId = '2'; state.addItem();
  assert.equal(state.draft.items.length, 1); assert.equal(state.draft.items[0].quantity, 2);
  state.draft.items[0].quantity = 99; state.menuId = '2'; state.addItem();
  assert.equal(state.draft.items[0].quantity, 99);
});

test('an order conflict retains the draft and shows the server error for recovery', async () => {
  const { state, pending, calls } = await componentState('Orders');
  state.draft = { table_id: '8', guests: 2, notes: 'No nuts', items: [{ menu_id: 2, quantity: 3, unit_price: 99 }] };
  const save = state.save();
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0].value)), { restaurant_id: 1, table_id: 8, guests: 2, notes: 'No nuts', items: [{ menu_id: 2, quantity: 3 }] });
  pending.get('post /orders').reject({ response: { data: { error: 'This table already has an active order' } } });
  await save;
  assert.equal(state.error, 'This table already has an active order');
  assert.equal(state.draft.items[0].quantity, 3); assert.equal(state.busy, false);
});

test('a successful status update reloads orders and table availability', async () => {
  const { state, pending, resolve } = await componentState('Orders');
  const update = state.setStatus({ id: 5 }, 'completed');
  pending.get('patch /orders/5/status').resolve({ data: {} });
  await new Promise(setImmediate);
  resolve('1', { orders: [{ id: 5, status: 'completed' }], tables: [{ id: 8, status: 'available' }] });
  await update;
  assert.equal(state.tables[0].status, 'available'); assert.equal(state.visibleOrders.length, 0); assert.equal(state.busy, false);
  state.filter = 'history'; assert.equal(state.visibleOrders[0].id, 5);
});

test('refreshing an occupied table keeps the draft assignment visible for correction', async () => {
  const { state, resolve } = await componentState('Orders');
  state.draft.table_id = '8';
  const load = state.loadOrders();
  resolve('1', { tables: [{ id: 8, name: 'Terrace', status: 'occupied', capacity: 4 }] });
  await load;
  assert.equal(state.draft.table_id, '8');
  assert.equal(state.selectedUnavailable, true);
  assert.equal(state.selectedTable.name, 'Terrace');
});
