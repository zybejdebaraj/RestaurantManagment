const { validId } = require('./validation');

function createRestaurantAccess(db) {
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

  return { requireOwnership };
}

module.exports = { createRestaurantAccess };
