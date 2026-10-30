const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function httpState() {
  const values = new Map([['restaurant-token', 'old-token'], ['user-info', 'owner']]);
  const events = [];
  let request, failure;
  const http = { interceptors: {
    request: { use(handler) { request = handler; } },
    response: { use(success, handler) { failure = handler; } },
  } };
  const source = fs.readFileSync(path.join(__dirname, '../src/services/http.js'), 'utf8')
    .replace(/^import .*;$/gm, '').replace('import.meta.env.VITE_API_URL', "'http://localhost:3001'")
    .replace('export default http;', '');
  vm.runInNewContext(source, {
    axios: { create: () => http },
    localStorage: { getItem: key => values.get(key), removeItem: key => values.delete(key) },
    window: { dispatchEvent: event => events.push(event.type) }, Event: class { constructor(type) { this.type = type; } },
  });
  return { values, events, request, failure };
}

test('a delayed 401 for an old token cannot clear a newer session', async () => {
  const state = httpState();
  const config = state.request({ url: '/orders', headers: {} });
  state.values.set('restaurant-token', 'new-token');
  const error = { response: { status: 401 }, config };
  await assert.rejects(state.failure(error), value => value === error);
  assert.equal(state.values.get('restaurant-token'), 'new-token');
  assert.equal(state.events.length, 0);
});

test('a 401 for the active token clears the session and emits one expiry event', async () => {
  const state = httpState();
  const config = state.request({ url: '/orders', headers: {} });
  await assert.rejects(state.failure({ response: { status: 401 }, config }));
  assert.equal(state.values.has('restaurant-token'), false);
  assert.equal(state.values.has('user-info'), false);
  assert.deepEqual(state.events, ['restaurant-session-expired']);
});

test('a failed login does not clear an existing session', async () => {
  const state = httpState();
  const config = state.request({ url: '/auth/login', headers: {} });
  await assert.rejects(state.failure({ response: { status: 401 }, config }));
  assert.equal(state.values.get('restaurant-token'), 'old-token');
});

function imageState() {
  const readers = [], emitted = [];
  const source = fs.readFileSync(path.join(__dirname, '../src/components/shared/ImagePicker.vue'), 'utf8')
    .match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*;$/gm, '').replace('export default', 'module.exports =');
  const context = {
    module: { exports: {} }, AppIcon: {},
    FileReader: class {
      constructor() { readers.push(this); }
      readAsDataURL(file) { this.file = file; }
    },
  };
  vm.runInNewContext(source, context);
  const component = context.module.exports;
  const state = { ...component.data(), $emit: (event, value) => emitted.push(value) };
  Object.entries(component.methods).forEach(([key, method]) => { state[key] = method.bind(state); });
  return { state, readers, emitted, component };
}

test('a slower image selection cannot overwrite a newer choice', () => {
  const { state, readers, emitted } = imageState();
  state.pick({ type: 'image/png', size: 10 }); state.pick({ type: 'image/png', size: 20 });
  readers[1].result = 'new-image'; readers[1].onload();
  readers[0].result = 'old-image'; readers[0].onload();
  assert.deepEqual(emitted, ['new-image']);
});

test('removing an image prevents pending reads and errors from restoring it', () => {
  const { state, readers, emitted } = imageState();
  state.pick({ type: 'image/png', size: 10 }); state.remove();
  readers[0].result = 'removed-image'; readers[0].onload(); readers[0].onerror();
  assert.deepEqual(emitted, ['']); assert.equal(state.error, '');
});
