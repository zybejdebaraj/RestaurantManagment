const jwt = require('jsonwebtoken');

function createAuth({ db, jwtSecret }) {
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

  return auth;
}

module.exports = { createAuth };
