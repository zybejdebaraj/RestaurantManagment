const { Router } = require('express');
const { createAuthController } = require('../controllers/authController');

function createRoutes(dependencies) {
  const router = Router();
  const { auth, limiter } = dependencies;
  const controller = createAuthController(dependencies);
  router.post('/users', limiter, controller.register);
  router.get('/users', controller.legacyLogin);
  router.post('/auth/login', limiter, controller.login);
  router.get('/auth/me', auth, controller.me);
  return router;
}

module.exports = createRoutes;
