const express = require('express');
const cors = require('cors');
const { createAuth } = require('./middleware/auth');
const { createAuthLimiter } = require('./middleware/rateLimit');
const { validateBody } = require('./middleware/validateBody');
const { errorHandler } = require('./middleware/errorHandler');
const { createRestaurantAccess } = require('./utils/restaurantAccess');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurant');
const menuRoutes = require('./routes/menu');
const reviewRoutes = require('./routes/review');
const tableRoutes = require('./routes/table');
const orderRoutes = require('./routes/order');

function createApp({ db, jwtSecret, origins = ['http://localhost:8080'] }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin(origin, done) { done(null, !origin || origins.includes(origin)); } }));
  app.use(express.json({ limit: '8mb' }));
  app.use(validateBody);

  const dependencies = {
    db,
    jwtSecret,
    auth: createAuth({ db, jwtSecret }),
    limiter: createAuthLimiter(),
    ...createRestaurantAccess(db),
  };
  app.use(healthRoutes(dependencies));
  app.use(authRoutes(dependencies));
  app.use(restaurantRoutes(dependencies));
  app.use(menuRoutes(dependencies));
  app.use(reviewRoutes(dependencies));
  app.use(tableRoutes(dependencies));
  app.use(orderRoutes(dependencies));
  app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
