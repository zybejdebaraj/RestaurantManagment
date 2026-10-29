const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the component methods with controlled responses to reproduce navigation races.
function menuState() {
  const pending = new Map();
  const http = {
    get(url) { return new Promise((resolve, reject) => pending.set(url, { resolve, reject })); },
    post(url, body) { return new Promise((resolve, reject) => pending.set(url, { resolve, reject, body })); },
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/components/views/RestaurantMenu.vue'), 'utf8');
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/^import .*;$/gm, '').replace('export default', 'module.exports =');
  const context = { module: { exports: {} }, http, AppIcon: {}, localStorage: { getItem: () => null } };
  vm.runInNewContext(script, context);
  const component = context.module.exports;
  const state = { ...component.data(), $route: { params: { id: '1' } } };
  Object.entries(component.methods).forEach(([name, method]) => { state[name] = method.bind(state); });
  function resolve(id) {
    pending.get(`/restaurant/${id}`).resolve({ data: { id: Number(id), name: `Restaurant ${id}` } });
    pending.get(`/menus/restaurant/${id}`).resolve({ data: [{ id: Number(id), name: `Dish ${id}` }] });
  }
  return { state, pending, resolve };
}

test('a slow previous menu cannot replace the current restaurant', async () => {
  const { state, resolve } = menuState();
  const old = state.load();
  state.$route.params.id = '2';
  const current = state.load();
  resolve('2'); await current;
  resolve('1'); await old;
  assert.equal(state.restaurant.id, 2);
  assert.equal(state.menus[0].name, 'Dish 2');
  assert.equal(state.loading, false);
});

test('a previous request failure cannot hide the current menu', async () => {
  const { state, pending, resolve } = menuState();
  const old = state.load();
  state.$route.params.id = '2';
  const current = state.load();
  resolve('2'); await current;
  pending.get('/restaurant/1').reject({ response: { status: 404 } });
  pending.get('/menus/restaurant/1').resolve({ data: [] });
  await old;
  assert.equal(state.error, '');
  assert.equal(state.restaurant.id, 2);
});

test('switching restaurants clears review drafts and ignores previous review feedback', async () => {
  const { state, pending, resolve } = menuState();
  const first = state.load(); resolve('1'); await first;
  state.rating = 5; state.reviewText = 'Review for the first restaurant';
  const review = state.review();
  assert.equal(pending.get('/reviews').body.restaurantId, 1);
  state.$route.params.id = '2';
  const next = state.load();
  assert.equal(state.rating, ''); assert.equal(state.reviewText, '');
  resolve('2'); await next;
  pending.get('/reviews').resolve({ data: {} }); await review;
  assert.equal(state.reviewMessage, '');
  assert.equal(state.reviewBusy, false);
  assert.equal(state.restaurant.id, 2);
});
