const { Router } = require('express');
const { createMenuController } = require('../controllers/menuController');

function createRoutes(dependencies) {
  const router = Router();
  const { auth } = dependencies;
  const controller = createMenuController(dependencies);
  router.get('/menus', (req, res, next) => req.query.mine === '1' ? auth(req, res, next) : next(), controller.list);
  router.get('/menus/restaurant/:id', controller.listByRestaurant);
  router.get('/menus/:id', controller.get);
  router.post('/menus', auth, controller.create);
  router.put('/menus/:id', auth, controller.update);
  router.delete('/menus/:id', auth, controller.remove);
  return router;
}

module.exports = createRoutes;
