const { Router } = require('express');
const { createRestaurantController } = require('../controllers/restaurantController');

function createRoutes(dependencies) {
  const router = Router();
  const { auth } = dependencies;
  const controller = createRestaurantController(dependencies);
  router.get('/restaurant', (req, res, next) => req.query.mine === '1' ? auth(req, res, next) : next(), controller.list);
  router.get('/restaurant/:id', controller.get);
  router.post('/restaurant', auth, controller.create);
  router.put('/restaurant/:id', auth, controller.update);
  router.delete('/restaurant/:id', auth, controller.remove);
  return router;
}

module.exports = createRoutes;
