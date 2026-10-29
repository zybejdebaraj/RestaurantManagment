const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { rateLimit } = require('express-rate-limit');

const restaurantImage = '/images/restaurant-placeholder.svg';
const menuImage = '/images/menu-placeholder.svg';
const publicUser = ({ id, name, email, role }) => ({ id, name, email, role });
const validId = (value) => ['string', 'number'].includes(typeof value) && /^\d+$/.test(String(value)) && Number.isInteger(Number(value)) && Number(value) > 0 && Number(value) <= 2147483647;
const validText = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
const safeImage = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  if (/^(https?:\/\/|\/(?!\/))/i.test(value)) return value;
  if (value.length <= 7 * 1024 * 1024 && /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=\r\n]+$/i.test(value)) return value;
  return fallback;
};

function createApp({ db, jwtSecret, origins = ['http://localhost:8080'] }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin(origin, done) { done(null, !origin || origins.includes(origin)); } }));
  app.use(express.json({ limit: '8mb' }));
  app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) {
      return res.status(400).json({ error: 'A JSON object body is required' });
    }
    next();
  });
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false,
    message: { error: 'Too many sign-in or signup attempts. Please try again in 15 minutes.' } });

  const auth = async (req, res, next) => {
    const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
    if (!match) return res.status(401).json({ error: 'Please sign in' });
    let decoded;
    try { decoded = jwt.verify(match[1], jwtSecret, { algorithms: ['HS256'] }); }
    catch { return res.status(401).json({ error: 'Your session has expired. Please sign in again.' }); }
    try {
      const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
      if (!result.rows.length) return res.status(401).json({ error: 'Please sign in again' });
      req.user = result.rows[0];
      next();
    } catch (error) { next(error); }
  };
  const issueSession = (user) => ({ ...publicUser(user), token: jwt.sign({ id: user.id }, jwtSecret, { algorithm: 'HS256', expiresIn: '8h' }) });
  const ownedRestaurant = async (id, user) => {
    if (!validId(id)) return null;
    const result = await db.query('SELECT * FROM restaurants WHERE id = $1', [id]);
    if (!result.rows.length) return null;
    return Number(result.rows[0].owner_id) === Number(user.id) ? result.rows[0] : false;
  };
  const requireOwnership = async (req, res, id) => {
    const restaurant = await ownedRestaurant(id, req.user);
    if (restaurant === null) res.status(404).json({ error: 'Restaurant not found' });
    else if (restaurant === false) res.status(403).json({ error: 'You can only manage your own restaurants' });
    return restaurant;
  };
  const menuFields = (body) => {
    const { name, price, description = '', category = 'Main Course', restaurant_id } = body;
    if (!validId(restaurant_id) || !validText(name, 100)
      || !['number', 'string'].includes(typeof price) || String(price).trim() === ''
      || !Number.isFinite(Number(price)) || Number(price) < 0 || Number(price) > 99999999.99
      || typeof description !== 'string' || description.length > 5000 || !validText(category, 100)) return null;
    return [restaurant_id, name.trim(), Number(price), description.trim(), category.trim(), safeImage(body.image, menuImage)];
  };

  app.get('/', (req, res) => res.json({ message: 'Restaurant API is running' }));
  app.get('/health', async (req, res, next) => {
    try { await db.query('SELECT 1'); res.json({ status: 'ok' }); } catch (error) { next(error); }
  });
  app.post('/users', limiter, async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!validText(name, 100) || !validText(email, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
      return res.status(400).json({ error: 'Enter your name, a valid email, and a password of 8 to 72 bytes.' });
    }
    try {
      const hash = await bcrypt.hash(password, 12);
      const result = await db.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role', [name.trim(), email.trim().toLowerCase(), hash, 'owner']);
      res.status(201).json(issueSession(result.rows[0]));
    } catch (error) { next(error); }
  });
  app.get('/users', (req, res) => res.status(405).json({ error: 'Use POST /auth/login. Passwords must not be sent in URLs.' }));
  app.post('/auth/login', limiter, async (req, res, next) => {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || Buffer.byteLength(password) > 72) return res.status(400).json({ error: 'Email and password are required' });
    try {
      const result = await db.query('SELECT id, name, email, role, password FROM users WHERE email = $1', [email.trim().toLowerCase()]);
      const user = result.rows[0];
      if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
      res.json(issueSession(user));
    } catch (error) { next(error); }
  });
  app.get('/auth/me', auth, (req, res) => res.json(publicUser(req.user)));
  app.get('/restaurant', async (req, res, next) => {
    if (req.query.mine === '1') return auth(req, res, async () => {
      try { res.json((await db.query('SELECT * FROM restaurants WHERE owner_id = $1 ORDER BY id DESC', [req.user.id])).rows); }
      catch (error) { next(error); }
    });
    try {
      const result = await db.query(`SELECT r.*, COALESCE(AVG(v.rating), 0)::float AS rating, COUNT(v.id)::int AS "reviewCount"
        FROM restaurants r LEFT JOIN reviews v ON v.restaurant_id = r.id GROUP BY r.id ORDER BY r.id DESC`);
      res.json(result.rows);
    } catch (error) { next(error); }
  });
  app.get('/restaurant/:id', async (req, res, next) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid restaurant ID' });
    try { const result = await db.query('SELECT * FROM restaurants WHERE id = $1', [req.params.id]);
      if (!result.rows.length) return res.status(404).json({ error: 'Restaurant not found' });
      res.json(result.rows[0]);
    } catch (error) { next(error); }
  });
  const restaurantValues = (body) => validText(body.name, 100) && validText(body.address, 255) && validText(body.contact, 50)
    ? [body.name.trim(), body.address.trim(), body.contact.trim(), safeImage(body.image, restaurantImage)] : null;
  app.post('/restaurant', auth, async (req, res, next) => {
    const values = restaurantValues(req.body);
    if (!values) return res.status(400).json({ error: 'Name, address, and contact are required' });
    try { const result = await db.query('INSERT INTO restaurants (name,address,contact,image,owner_id) VALUES ($1,$2,$3,$4,$5) RETURNING *', [...values, req.user.id]);res.status(201).json(result.rows[0]); }
    catch (error) { next(error); }
  });
  app.put('/restaurant/:id', auth, async (req, res, next) => {
    try {
      if (!await requireOwnership(req, res, req.params.id)) return;
      const values = restaurantValues(req.body);
      if (!values) return res.status(400).json({ error: 'Name, address, and contact are required' });
      res.json((await db.query('UPDATE restaurants SET name=$1,address=$2,contact=$3,image=$4 WHERE id=$5 RETURNING *', [...values, req.params.id])).rows[0]);
    } catch (error) { next(error); }
  });
  app.delete('/restaurant/:id', auth, async (req, res, next) => {
    try { if (!await requireOwnership(req, res, req.params.id)) return;
      await db.query('DELETE FROM restaurants WHERE id = $1', [req.params.id]);res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) { next(error); }
  });

  app.get('/menus', async (req, res, next) => {
    if (req.query.mine === '1') return auth(req, res, async () => {
      try { const result = await db.query('SELECT m.* FROM menus m JOIN restaurants r ON r.id=m.restaurant_id WHERE r.owner_id=$1 ORDER BY m.id DESC', [req.user.id]);res.json(result.rows.map((m) => ({ ...m, price: Number(m.price) }))); }
      catch (error) { next(error); }
    });
    try { res.json((await db.query('SELECT * FROM menus ORDER BY id DESC')).rows.map((m) => ({ ...m, price: Number(m.price) }))); } catch (error) { next(error); }
  });
  app.get('/menus/restaurant/:id', async (req, res, next) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid restaurant ID' });
    try { const exists = await db.query('SELECT id FROM restaurants WHERE id=$1', [req.params.id]);
      if (!exists.rows.length) return res.status(404).json({ error: 'Restaurant not found' });
      res.json((await db.query('SELECT * FROM menus WHERE restaurant_id=$1 ORDER BY id', [req.params.id])).rows.map((m) => ({ ...m, price: Number(m.price) })));
    } catch (error) { next(error); }
  });
  app.get('/menus/:id', async (req, res, next) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid menu ID' });
    try { const result = await db.query('SELECT * FROM menus WHERE id=$1', [req.params.id]);
      if (!result.rows.length) return res.status(404).json({ error: 'Menu not found' });
      res.json({ ...result.rows[0], price: Number(result.rows[0].price) });
    } catch (error) { next(error); }
  });
  app.post('/menus', auth, async (req, res, next) => {
    const values = menuFields(req.body);
    if (!values) return res.status(400).json({ error: 'Provide a restaurant, item name, valid category, and non-negative price' });
    try { if (!await requireOwnership(req, res, values[0])) return;
      const result = await db.query('INSERT INTO menus (restaurant_id,name,price,description,category,image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', values);
      res.status(201).json({ ...result.rows[0], price: Number(result.rows[0].price) });
    } catch (error) { next(error); }
  });
  app.put('/menus/:id', auth, async (req, res, next) => {
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
  });
  app.delete('/menus/:id', auth, async (req, res, next) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid menu ID' });
    try { const existing = await db.query('SELECT * FROM menus WHERE id=$1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Menu not found' });
      if (!await requireOwnership(req, res, existing.rows[0].restaurant_id)) return;
      await db.query('DELETE FROM menus WHERE id=$1', [req.params.id]);res.json({ message: 'Menu deleted successfully' });
    } catch (error) { next(error); }
  });
  app.post('/reviews', auth, async (req, res, next) => {
    const { restaurantId, rating, text = '' } = req.body;
    if (!validId(restaurantId) || !['string', 'number'].includes(typeof rating) || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || typeof text !== 'string' || text.length > 3000) return res.status(400).json({ error: 'A restaurant and rating from 1 to 5 are required' });
    try { const result = await db.query(`INSERT INTO reviews (restaurant_id,user_id,rating,text) VALUES ($1,$2,$3,$4)
      ON CONFLICT (restaurant_id,user_id) DO UPDATE SET rating=EXCLUDED.rating,text=EXCLUDED.text RETURNING *`, [restaurantId, req.user.id, Number(rating), text.trim()]);res.status(201).json(result.rows[0]); }
    catch (error) { next(error); }
  });
  app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === '23505') return res.status(409).json({ error: 'This email is already registered' });
    if (error.code === '23503') return res.status(400).json({ error: 'The linked record does not exist or is still in use' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'The upload is too large. Choose an image up to 5 MB.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
    console.error('API request failed:', error.code || error.name);
    res.status(500).json({ error: 'An unexpected server error occurred' });
  });
  return app;
}

module.exports = { createApp };
