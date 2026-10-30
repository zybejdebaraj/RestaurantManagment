const { Router } = require('express');
const { createTableController } = require('../controllers/tableController');

module.exports = dependencies => {
  const router = Router();
  const controller = createTableController(dependencies);
  router.use('/tables', dependencies.auth);
  router.get('/tables', controller.list);
  router.post('/tables', controller.create);
  router.put('/tables/:id', controller.update);
  router.delete('/tables/:id', controller.remove);
  return router;
};
