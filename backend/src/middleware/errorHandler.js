const { RequestError } = require('../utils/operations');

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof RequestError) return res.status(error.status).json({ error: error.message });
  if (error.code === '23505' && error.constraint === 'restaurant_tables_restaurant_id_name_key') return res.status(409).json({ error: 'This table name already exists in this restaurant' });
  if (error.code === '23505' && error.constraint === 'orders_active_table_idx') return res.status(409).json({ error: 'This table already has an active order' });
  if (error.code === '23505') return res.status(409).json({ error: 'This email is already registered' });
  if (error.code === '23503') return res.status(400).json({ error: 'The linked record does not exist or is still in use' });
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'The upload is too large. Choose an image up to 5 MB.' });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  console.error('API request failed:', error.code || error.name);
  res.status(500).json({ error: 'An unexpected server error occurred' });
}

module.exports = { errorHandler };
