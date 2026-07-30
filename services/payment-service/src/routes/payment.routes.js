const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.controller');
const { processPaymentValidation } = require('../middleware/validation');

router.post('/process', processPaymentValidation, controller.processPayment);
router.get('/order/:orderId', controller.getPaymentsByOrder);
router.get('/:paymentId', controller.getPayment);

module.exports = router;
