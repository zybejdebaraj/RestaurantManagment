const { Router } = require('express');
const { createReviewController } = require('../controllers/reviewController');

function createRoutes(dependencies) {
  const router = Router();
  const { auth } = dependencies;
  const controller = createReviewController(dependencies);
  router.post('/reviews', auth, controller.create);
  return router;
}

module.exports = createRoutes;
