const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { publicUser, validText } = require('../utils/validation');

function createAuthController({ db, jwtSecret }) {
  const issueSession = (user) => ({ ...publicUser(user), token: jwt.sign({ id: user.id }, jwtSecret, { algorithm: 'HS256', expiresIn: '8h' }) });
  const register = async (req, res, next) => {
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
  };
  const legacyLogin = (req, res) => res.status(405).json({ error: 'Use POST /auth/login. Passwords must not be sent in URLs.' });
  const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || Buffer.byteLength(password) > 72) return res.status(400).json({ error: 'Email and password are required' });
    try {
      const result = await db.query('SELECT id, name, email, role, password FROM users WHERE email = $1', [email.trim().toLowerCase()]);
      const user = result.rows[0];
      if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
      res.json(issueSession(user));
    } catch (error) { next(error); }
  };
  const me = (req, res) => res.json(publicUser(req.user));

  return { register, legacyLogin, login, me };
}

module.exports = { createAuthController };
