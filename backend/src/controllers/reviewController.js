const { validId } = require('../utils/validation');

function createReviewController({ db }) {
  const create = async (req, res, next) => {
    const { restaurantId, rating, text = '' } = req.body;
    if (!validId(restaurantId) || !['string', 'number'].includes(typeof rating) || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || typeof text !== 'string' || text.length > 3000) return res.status(400).json({ error: 'A restaurant and rating from 1 to 5 are required' });
    try { const result = await db.query(`INSERT INTO reviews (restaurant_id,user_id,rating,text) VALUES ($1,$2,$3,$4)
      ON CONFLICT (restaurant_id,user_id) DO UPDATE SET rating=EXCLUDED.rating,text=EXCLUDED.text RETURNING *`, [restaurantId, req.user.id, Number(rating), text.trim()]);res.status(201).json(result.rows[0]); }
    catch (error) { next(error); }
  };

  return { create };
}

module.exports = { createReviewController };
