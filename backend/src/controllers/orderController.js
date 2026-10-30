const { validId } = require('../utils/validation');
const { RequestError, transitions, orderItems, transaction, ownedRestaurant } = require('../utils/operations');

function normalize(order) {
  return { ...order, total: Number(order.total), items: order.items.map(item => ({ ...item, unit_price: Number(item.unit_price) })) };
}

const orderSelect = `SELECT o.*, COALESCE(json_agg(json_build_object('id', i.id, 'menu_id', i.menu_id,
  'name', i.name, 'unit_price', i.unit_price, 'quantity', i.quantity) ORDER BY i.id)
  FILTER (WHERE i.id IS NOT NULL), '[]') AS items
  FROM orders o LEFT JOIN order_items i ON i.order_id=o.id`;

async function readOrder(client, id) {
  return normalize((await client.query(`${orderSelect} WHERE o.id=$1 GROUP BY o.id`, [id])).rows[0]);
}

async function lockOrder(client, id, ownerId) {
  if (!validId(id)) throw new RequestError(400, 'Invalid order ID');
  const result = await client.query(`SELECT o.* FROM orders o JOIN restaurants r ON r.id=o.restaurant_id
    WHERE o.id=$1 AND r.owner_id=$2 FOR UPDATE OF o`, [id, ownerId]);
  if (!result.rows.length) throw new RequestError(404, 'Order not found');
  return result.rows[0];
}

async function writeItems(client, orderId, restaurantId, items) {
  const menus = await client.query('SELECT id,name,price FROM menus WHERE restaurant_id=$1 AND id=ANY($2::int[]) ORDER BY id FOR SHARE', [restaurantId, items.map(item => item.menu_id)]);
  if (menus.rows.length !== items.length) throw new RequestError(400, 'Every item must be on this restaurant’s menu');
  await client.query('DELETE FROM order_items WHERE order_id=$1', [orderId]);
  for (const item of items) {
    const menu = menus.rows.find(menu => Number(menu.id) === item.menu_id);
    await client.query('INSERT INTO order_items (order_id,menu_id,name,unit_price,quantity) VALUES ($1,$2,$3,$4,$5)', [orderId, menu.id, menu.name, menu.price, item.quantity]);
  }
  await client.query('UPDATE orders SET total=(SELECT SUM(unit_price*quantity) FROM order_items WHERE order_id=$1),updated_at=NOW() WHERE id=$1', [orderId]);
}

function createOrderController({ db }) {
  async function list(req, res, next) {
    try {
      await ownedRestaurant(db, req.query.restaurant_id, req.user.id);
      const result = await db.query(`${orderSelect} WHERE o.restaurant_id=$1 GROUP BY o.id ORDER BY o.created_at DESC,o.id DESC`, [req.query.restaurant_id]);
      res.json(result.rows.map(normalize));
    } catch (error) { next(error); }
  }

  async function create(req, res, next) {
    try {
      const items = orderItems(req.body.items);
      const { restaurant_id, table_id = null, guests = 1, notes = '' } = req.body;
      if ((table_id !== null && !validId(table_id)) || !Number.isInteger(guests) || guests < 1 || guests > 500
        || typeof notes !== 'string' || notes.length > 2000) throw new RequestError(400, 'Enter a valid table, guest count from 1 to 500, and notes up to 2000 characters');
      const order = await transaction(db, async client => {
        await ownedRestaurant(client, restaurant_id, req.user.id);
        let table = null;
        if (table_id !== null) {
          table = (await client.query('SELECT * FROM restaurant_tables WHERE id=$1 AND restaurant_id=$2 FOR UPDATE', [table_id, restaurant_id])).rows[0];
          if (!table) throw new RequestError(404, 'Table not found in this restaurant');
          if (guests > table.capacity) throw new RequestError(400, 'Guest count exceeds the table capacity');
          const active = await client.query("SELECT id FROM orders WHERE table_id=$1 AND status NOT IN ('completed','cancelled')", [table_id]);
          if (active.rows.length) throw new RequestError(409, 'This table already has an active order');
        }
        const inserted = await client.query('INSERT INTO orders (restaurant_id,table_id,table_name,guests,notes) VALUES ($1,$2,$3,$4,$5) RETURNING id', [restaurant_id, table_id, table?.name || null, guests, notes.trim()]);
        await writeItems(client, inserted.rows[0].id, restaurant_id, items);
        return readOrder(client, inserted.rows[0].id);
      });
      res.status(201).json(order);
    } catch (error) { next(error); }
  }

  async function updateItems(req, res, next) {
    try {
      const items = orderItems(req.body.items);
      const order = await transaction(db, async client => {
        const existing = await lockOrder(client, req.params.id, req.user.id);
        if (existing.status !== 'pending') throw new RequestError(409, 'Items can only be changed before preparation starts');
        await writeItems(client, existing.id, existing.restaurant_id, items);
        return readOrder(client, existing.id);
      });
      res.json(order);
    } catch (error) { next(error); }
  }

  async function updateStatus(req, res, next) {
    try {
      if (!Object.hasOwn(transitions, req.body.status)) throw new RequestError(400, 'Invalid order status');
      const order = await transaction(db, async client => {
        const existing = await lockOrder(client, req.params.id, req.user.id);
        if (!transitions[existing.status].includes(req.body.status)) throw new RequestError(409, 'This order status change is not allowed');
        await client.query('UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2', [req.body.status, existing.id]);
        return readOrder(client, existing.id);
      });
      res.json(order);
    } catch (error) { next(error); }
  }

  return { list, create, updateItems, updateStatus };
}

module.exports = { createOrderController };
