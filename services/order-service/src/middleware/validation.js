const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const createOrderValidation = [
  body('userId').trim().notEmpty().withMessage('User ID is required'),
  body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
  body('products.*.productId').trim().notEmpty().withMessage('Product ID is required'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod')
    .isIn(['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING'])
    .withMessage('Invalid payment method'),
  validate
];

const updateStatusValidation = [
  param('id').trim().notEmpty().withMessage('Order ID is required'),
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED'])
    .withMessage('Invalid order status'),
  validate
];

const orderIdValidation = [
  param('id').trim().notEmpty().withMessage('Order ID is required'),
  validate
];

module.exports = {
  createOrderValidation,
  updateStatusValidation,
  orderIdValidation
};
