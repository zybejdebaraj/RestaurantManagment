const { Router } = require('express');
const { createOrderController } = require('../controllers/orderController');

module.exports = dependencies => {
  const router = Router();
  const controller = createOrderController(dependencies);
  router.use('/orders', dependencies.auth);
  router.get('/orders', controller.list);
  router.post('/orders', controller.create);
  router.put('/orders/:id/items', controller.updateItems);
  router.patch('/orders/:id/status', controller.updateStatus);
  return router;
};
