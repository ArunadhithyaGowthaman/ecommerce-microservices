const express = require('express');
const router = express.Router();
const controller = require('../controllers/order.controller');
const {
  createOrderValidation,
  updateStatusValidation,
  orderIdValidation
} = require('../middleware/validation');

router.post('/', createOrderValidation, controller.createOrder);
router.get('/', controller.getAllOrders);
router.get('/user/:userId', controller.getUserOrders);
router.get('/:id', orderIdValidation, controller.getOrder);
router.put('/:id/status', updateStatusValidation, controller.updateStatus);
router.put('/:id/cancel', orderIdValidation, controller.cancelOrder);

module.exports = router;
