const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Product');
const logger = require('../../logger');

const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) return;

  const products = [
    { productId: 'PROD001', name: 'Wireless Headphones', category: 'Electronics', price: 79.99, quantityAvailable: 50, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', description: 'Premium noise-cancelling wireless headphones.' },
    { productId: 'PROD002', name: 'Smart Watch', category: 'Electronics', price: 199.99, quantityAvailable: 30, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', description: 'Feature-rich smartwatch with health tracking.' },
    { productId: 'PROD003', name: 'Running Shoes', category: 'Footwear', price: 89.99, quantityAvailable: 100, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', description: 'Lightweight running shoes for all terrains.' },
    { productId: 'PROD004', name: 'Laptop Backpack', category: 'Accessories', price: 49.99, quantityAvailable: 75, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', description: 'Durable backpack with laptop compartment.' },
    { productId: 'PROD005', name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99, quantityAvailable: 40, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', description: 'Portable speaker with deep bass.' },
    { productId: 'PROD006', name: 'Coffee Maker', category: 'Home', price: 129.99, quantityAvailable: 25, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400', description: 'Programmable drip coffee maker.' }
  ];

  await Product.insertMany(products);
  logger.info('[Inventory Service] Sample products seeded');
};

const getAllProducts = async () => {
  return Product.find().select('-__v');
};

const getProductById = async (productId) => {
  return Product.findOne({ productId });
};

const checkStock = async (productId, quantity = 1) => {
  const product = await Product.findOne({ productId });
  if (!product) {
    return { available: false, productId, message: 'Product not found' };
  }
  return {
    available: product.quantityAvailable >= quantity,
    productId,
    name: product.name,
    quantityAvailable: product.quantityAvailable,
    requestedQuantity: quantity,
    price: product.price
  };
};

const checkMultipleProducts = async (items) => {
  const results = [];
  let allAvailable = true;

  for (const item of items) {
    const check = await checkStock(item.productId, item.quantity);
    results.push(check);
    if (!check.available) allAvailable = false;
  }

  return { allAvailable, items: results };
};

const addProduct = async (data) => {
  const product = new Product({
    productId: data.productId || `PROD${uuidv4().slice(0, 6).toUpperCase()}`,
    name: data.name,
    category: data.category,
    price: data.price,
    quantityAvailable: data.quantityAvailable,
    image: data.image || '',
    description: data.description || ''
  });
  return product.save();
};

const updateStock = async (productId, quantity) => {
  const product = await Product.findOne({ productId });
  if (!product) throw new Error('Product not found');

  if (product.quantityAvailable < quantity) {
    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantityAvailable}`);
  }

  product.quantityAvailable -= quantity;
  await product.save();
  return product;
};

const handlePaymentCompleted = async (event) => {
  const { orderId, products } = event;
  logger.info(`[Inventory Service] Reducing stock for order ${orderId}`);

  for (const item of products) {
    await updateStock(item.productId, item.quantity);
    logger.info(`[Inventory Service] Reduced ${item.quantity} units of ${item.productId}`);
  }
};

module.exports = {
  seedProducts,
  getAllProducts,
  getProductById,
  checkStock,
  checkMultipleProducts,
  addProduct,
  updateStock,
  handlePaymentCompleted
};