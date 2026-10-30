const { Router } = require('express');
const { createHealthController } = require('../controllers/healthController');

function createRoutes(dependencies) {
  const router = Router();
  const controller = createHealthController(dependencies);
  router.get('/', controller.index);
  router.get('/health', controller.health);
  return router;
}

module.exports = createRoutes;
