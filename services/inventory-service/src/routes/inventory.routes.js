const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventory.controller');
const {
  addProductValidation,
  updateStockValidation,
  checkStockValidation,
  checkBatchValidation
} = require('../middleware/validation');

router.get('/products', controller.getProducts);
router.get('/products/:productId', controller.getProduct);
router.get('/check/:productId', checkStockValidation, controller.checkAvailability);
router.post('/check-batch', checkBatchValidation, controller.checkBatchAvailability);
router.post('/products', addProductValidation, controller.addProduct);
router.put('/update-stock', updateStockValidation, controller.reduceStock);

module.exports = router;
