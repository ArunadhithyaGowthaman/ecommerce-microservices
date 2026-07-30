const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const processPaymentValidation = [
  body('orderId').trim().notEmpty().withMessage('Order ID is required'),
  body('userId').trim().notEmpty().withMessage('User ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod')
    .isIn(['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING'])
    .withMessage('Invalid payment method'),
  validate
];

module.exports = { processPaymentValidation };
