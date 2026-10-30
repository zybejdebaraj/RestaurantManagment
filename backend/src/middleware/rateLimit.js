const { rateLimit } = require('express-rate-limit');

function createAuthLimiter() {
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false,
    message: { error: 'Too many sign-in or signup attempts. Please try again in 15 minutes.' } });


  return limiter;
}

module.exports = { createAuthLimiter };
