const { validId } = require('./validation');

class RequestError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const transitions = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['served', 'cancelled'],
  served: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

function tableFields(body) {
  if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 50
    || !Number.isInteger(body.capacity) || body.capacity < 1 || body.capacity > 500) {
    throw new RequestError(400, 'Enter a table name and capacity from 1 to 500');
  }
  return [body.name.trim(), body.capacity];
}

function orderItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) throw new RequestError(400, 'Choose between 1 and 100 menu items');
  const seen = new Set();
  return items.map(item => {
    if (!item || !validId(item.menu_id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99
      || seen.has(Number(item.menu_id))) throw new RequestError(400, 'Choose distinct menu items with quantities from 1 to 99');
    seen.add(Number(item.menu_id));
    return { menu_id: Number(item.menu_id), quantity: item.quantity };
  });
}

async function transaction(db, action) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await action(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

async function ownedRestaurant(client, restaurantId, ownerId) {
  if (!validId(restaurantId)) throw new RequestError(400, 'Choose a valid restaurant');
  const result = await client.query('SELECT id FROM restaurants WHERE id=$1 AND owner_id=$2 FOR SHARE', [restaurantId, ownerId]);
  if (!result.rows.length) throw new RequestError(404, 'Restaurant not found');
}

module.exports = { RequestError, transitions, tableFields, orderItems, transaction, ownedRestaurant };
