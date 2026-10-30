const { validId } = require('../utils/validation');
const { RequestError, tableFields, transaction, ownedRestaurant } = require('../utils/operations');

const activeOrder = "SELECT id FROM orders WHERE table_id=$1 AND status NOT IN ('completed','cancelled')";

function createTableController({ db }) {
  async function list(req, res, next) {
    try {
      await ownedRestaurant(db, req.query.restaurant_id, req.user.id);
      const result = await db.query(`SELECT t.*, o.id AS active_order_id,
        CASE WHEN o.id IS NULL THEN 'available' ELSE 'occupied' END AS status
        FROM restaurant_tables t LEFT JOIN orders o ON o.table_id=t.id AND o.status NOT IN ('completed','cancelled')
        WHERE t.restaurant_id=$1 ORDER BY t.name, t.id`, [req.query.restaurant_id]);
      res.json(result.rows);
    } catch (error) { next(error); }
  }

  async function create(req, res, next) {
    try {
      const values = tableFields(req.body);
      const table = await transaction(db, async client => {
        await ownedRestaurant(client, req.body.restaurant_id, req.user.id);
        return (await client.query('INSERT INTO restaurant_tables (restaurant_id,name,capacity) VALUES ($1,$2,$3) RETURNING *', [req.body.restaurant_id, ...values])).rows[0];
      });
      res.status(201).json({ ...table, status: 'available', active_order_id: null });
    } catch (error) { next(error); }
  }

  async function change(req, res, next, deleting) {
    try {
      if (!validId(req.params.id)) throw new RequestError(400, 'Invalid table ID');
      const values = deleting ? null : tableFields(req.body);
      const result = await transaction(db, async client => {
        const existing = await client.query(`SELECT t.* FROM restaurant_tables t JOIN restaurants r ON r.id=t.restaurant_id
          WHERE t.id=$1 AND r.owner_id=$2 FOR UPDATE OF t`, [req.params.id, req.user.id]);
        if (!existing.rows.length) throw new RequestError(404, 'Table not found');
        if ((await client.query(activeOrder, [req.params.id])).rows.length) throw new RequestError(409, 'Complete or cancel the active order before changing this table');
        if (deleting) {
          await client.query('DELETE FROM restaurant_tables WHERE id=$1', [req.params.id]);
          return { message: 'Table deleted successfully' };
        }
        const updated = await client.query('UPDATE restaurant_tables SET name=$1,capacity=$2 WHERE id=$3 RETURNING *', [...values, req.params.id]);
        return { ...updated.rows[0], status: 'available', active_order_id: null };
      });
      res.json(result);
    } catch (error) { next(error); }
  }

  return { list, create, update: (req, res, next) => change(req, res, next, false), remove: (req, res, next) => change(req, res, next, true) };
}

module.exports = { createTableController };
