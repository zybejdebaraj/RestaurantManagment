function validateBody(req, res, next) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) {
    return res.status(400).json({ error: 'A JSON object body is required' });
  }
  next();
}

module.exports = { validateBody };
