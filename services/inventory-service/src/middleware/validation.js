const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const addProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantityAvailable').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  validate
];

const updateStockValidation = [
  body('productId').trim().notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
];

const checkStockValidation = [
  param('productId').trim().notEmpty().withMessage('Product ID is required'),
  validate
];

const checkBatchValidation = [
  body('items').isArray({ min: 1 }).withMessage('Items array is required'),
  body('items.*.productId').trim().notEmpty().withMessage('Each item must have a productId'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item must have a valid quantity'),
  validate
];

module.exports = {
  addProductValidation,
  updateStockValidation,
  checkStockValidation,
  checkBatchValidation
};
