
function createHealthController({ db }) {
  const index = (req, res) => res.json({ message: 'Restaurant API is running' });
  const health = async (req, res, next) => {
    try { await db.query('SELECT 1'); res.json({ status: 'ok' }); } catch (error) { next(error); }
  };

  return { index, health };
}

module.exports = { createHealthController };
