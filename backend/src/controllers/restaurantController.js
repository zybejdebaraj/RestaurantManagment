const { validId, restaurantValues } = require('../utils/validation');

function createRestaurantController({ db, requireOwnership }) {
  const list = async (req, res, next) => {
    if (req.query.mine === '1') {
      try { res.json((await db.query('SELECT * FROM restaurants WHERE owner_id = $1 ORDER BY id DESC', [req.user.id])).rows); }
      catch (error) { next(error); }
      return;
    }
    try {
      const result = await db.query(`SELECT r.*, COALESCE(AVG(v.rating), 0)::float AS rating, COUNT(v.id)::int AS "reviewCount"
        FROM restaurants r LEFT JOIN reviews v ON v.restaurant_id = r.id GROUP BY r.id ORDER BY r.id DESC`);
      res.json(result.rows);
    } catch (error) { next(error); }
  };
  const get = async (req, res, next) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid restaurant ID' });
    try { const result = await db.query('SELECT * FROM restaurants WHERE id = $1', [req.params.id]);
      if (!result.rows.length) return res.status(404).json({ error: 'Restaurant not found' });
      res.json(result.rows[0]);
    } catch (error) { next(error); }
  };
  const create = async (req, res, next) => {
    const values = restaurantValues(req.body);
    if (!values) return res.status(400).json({ error: 'Name, address, and contact are required' });
    try { const result = await db.query('INSERT INTO restaurants (name,address,contact,image,owner_id) VALUES ($1,$2,$3,$4,$5) RETURNING *', [...values, req.user.id]);res.status(201).json(result.rows[0]); }
    catch (error) { next(error); }
  };
  const update = async (req, res, next) => {
    try {
      if (!await requireOwnership(req, res, req.params.id)) return;
      const values = restaurantValues(req.body);
      if (!values) return res.status(400).json({ error: 'Name, address, and contact are required' });
      res.json((await db.query('UPDATE restaurants SET name=$1,address=$2,contact=$3,image=$4 WHERE id=$5 RETURNING *', [...values, req.params.id])).rows[0]);
    } catch (error) { next(error); }
  };
  const remove = async (req, res, next) => {
    try { if (!await requireOwnership(req, res, req.params.id)) return;
      await db.query('DELETE FROM restaurants WHERE id = $1', [req.params.id]);res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) { next(error); }
  };

  return { list, get, create, update, remove };
}

module.exports = { createRestaurantController };
