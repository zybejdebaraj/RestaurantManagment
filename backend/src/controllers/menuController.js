const { validId, menuFields } = require('../utils/validation');

function createMenuController({ db, requireOwnership }) {
  const list = async (req, res, next) => {
    if (req.query.mine === '1') {
      try { const result = await db.query('SELECT m.* FROM menus m JOIN restaurants r ON r.id=m.restaurant_id WHERE r.owner_id=$1 ORDER BY m.id DESC', [req.user.id]);res.json(result.rows.map((m) => ({ ...m, price: Number(m.price) }))); }
      catch (error) { next(error); }
      return;
    }
    try { res.json((await db.query('SELECT * FROM menus ORDER BY id DESC')).rows.map((m) => ({ ...m, price: Number(m.price) }))); } catch (error) { next(error); }
  };
  const listByRestaurant = async (req, res, next) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid restaurant ID' });
    try { const exists = await db.query('SELECT id FROM restaurants WHERE id=$1', [req.params.id]);
      if (!exists.rows.length) return res.status(404).json({ error: 'Restaurant not found' });
      res.json((await db.query('SELECT * FROM menus WHERE restaurant_id=$1 ORDER BY id', [req.params.id])).rows.map((m) => ({ ...m, price: Number(m.price) })));
    } catch (error) { next(error); }
  };
  const get = async (req, res, next) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid menu ID' });
    try { const result = await db.query('SELECT * FROM menus WHERE id=$1', [req.params.id]);
      if (!result.rows.length) return res.status(404).json({ error: 'Menu not found' });
      res.json({ ...result.rows[0], price: Number(result.rows[0].price) });
    } catch (error) { next(error); }
  };
  const create = async (req, res, next) => {
    const values = menuFields(req.body);
    if (!values) return res.status(400).json({ error: 'Provide a restaurant, item name, valid category, and non-negative price' });
    try { if (!await requireOwnership(req, res, values[0])) return;
      const result = await db.query('INSERT INTO menus (restaurant_id,name,price,description,category,image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', values);
      res.status(201).json({ ...result.rows[0], price: Number(result.rows[0].price) });
    } catch (error) { next(error); }
  };
  const update = async (req, res, next) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid menu ID' });
    try {
      const existing = await db.query('SELECT * FROM menus WHERE id=$1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Menu not found' });
      if (!await requireOwnership(req, res, existing.rows[0].restaurant_id)) return;
      const values = menuFields({ ...existing.rows[0], ...req.body });
      if (!values) return res.status(400).json({ error: 'Invalid menu item fields' });
      if (!await requireOwnership(req, res, values[0])) return;
      const result = await db.query('UPDATE menus SET restaurant_id=$1,name=$2,price=$3,description=$4,category=$5,image=$6 WHERE id=$7 RETURNING *', [...values, req.params.id]);
      res.json({ ...result.rows[0], price: Number(result.rows[0].price) });
    } catch (error) { next(error); }
  };
  const remove = async (req, res, next) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid menu ID' });
    try { const existing = await db.query('SELECT * FROM menus WHERE id=$1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Menu not found' });
      if (!await requireOwnership(req, res, existing.rows[0].restaurant_id)) return;
      await db.query('DELETE FROM menus WHERE id=$1', [req.params.id]);res.json({ message: 'Menu deleted successfully' });
    } catch (error) { next(error); }
  };

  return { list, listByRestaurant, get, create, update, remove };
}

module.exports = { createMenuController };
