const inventoryService = require('../services/inventory.service');

const getProducts = async (req, res, next) => {
  try {
    const products = await inventoryService.getAllProducts();
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await inventoryService.getProductById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const quantity = parseInt(req.query.quantity) || 1;
    const result = await inventoryService.checkStock(req.params.productId, quantity);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const checkBatchAvailability = async (req, res, next) => {
  try {
    const result = await inventoryService.checkMultipleProducts(req.body.items);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const product = await inventoryService.addProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Product ID already exists' });
    }
    next(error);
  }
};

const reduceStock = async (req, res, next) => {
  try {
    const product = await inventoryService.updateStock(req.body.productId, req.body.quantity);
    res.json({ success: true, data: product });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Insufficient')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  checkAvailability,
  checkBatchAvailability,
  addProduct,
  reduceStock
};
