const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const { publishEvent } = require('../config/rabbitmq');

const INVENTORY_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003';
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3002';

const checkInventory = async (products) => {
  const items = products.map((p) => ({ productId: p.productId, quantity: p.quantity }));
  const response = await axios.post(`${INVENTORY_URL}/api/inventory/check-batch`, { items });
  return response.data.data;
};

const processPayment = async (orderData) => {
  const response = await axios.post(`${PAYMENT_URL}/api/payment/process`, {
    orderId: orderData.orderId,
    userId: orderData.userId,
    amount: orderData.totalAmount,
    paymentMethod: orderData.paymentMethod,
    products: orderData.products
  });
  return response.data.data;
};

const createOrder = async ({ userId, products, paymentMethod }) => {
  const inventoryCheck = await checkInventory(products);

  if (!inventoryCheck.allAvailable) {
    const unavailable = inventoryCheck.items.filter((i) => !i.available);
    throw Object.assign(
      new Error(`Insufficient stock for: ${unavailable.map((i) => i.productId).join(', ')}`),
      { statusCode: 400 }
    );
  }

  const enrichedProducts = products.map((item) => {
    const invItem = inventoryCheck.items.find((i) => i.productId === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: invItem.price
    };
  });

  const totalAmount = enrichedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const orderId = `ORD${uuidv4().slice(0, 8).toUpperCase()}`;

  const order = new Order({
    orderId,
    userId,
    products: enrichedProducts,
    totalAmount,
    orderStatus: 'PENDING'
  });
  await order.save();

  await publishEvent('order.created', {
    eventType: 'OrderCreated',
    orderId,
    userId,
    products: enrichedProducts,
    totalAmount,
    timestamp: new Date().toISOString()
  });

  try {
    const paymentResult = await processPayment({
      orderId,
      userId,
      totalAmount,
      paymentMethod,
      products: enrichedProducts
    });

    if (paymentResult.status === 'SUCCESS') {
      order.orderStatus = 'CONFIRMED';
      order.paymentId = paymentResult.paymentId;
    } else {
      order.orderStatus = 'PAYMENT_FAILED';
    }
    await order.save();

    return { order, payment: paymentResult };
  } catch (paymentError) {
    order.orderStatus = 'PAYMENT_FAILED';
    await order.save();
    throw Object.assign(
      new Error(paymentError.response?.data?.message || 'Payment processing failed'),
      { statusCode: 402 }
    );
  }
};

const getOrderById = async (orderId) => {
  return Order.findOne({ orderId });
};

const getOrdersByUserId = async (userId) => {
  return Order.find({ userId }).sort({ createdAt: -1 });
};

const getAllOrders = async () => {
  return Order.find().sort({ createdAt: -1 });
};

const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findOne({ orderId });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED', 'PAYMENT_FAILED'],
    CONFIRMED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
    PAYMENT_FAILED: ['PENDING']
  };

  if (!validTransitions[order.orderStatus]?.includes(status)) {
    throw Object.assign(
      new Error(`Cannot transition from ${order.orderStatus} to ${status}`),
      { statusCode: 400 }
    );
  }

  order.orderStatus = status;
  await order.save();

  if (status === 'CANCELLED') {
    await publishEvent('order.cancelled', {
      eventType: 'OrderCancelled',
      orderId: order.orderId,
      userId: order.userId,
      totalAmount: order.totalAmount,
      timestamp: new Date().toISOString()
    });
  }

  return order;
};

const cancelOrder = async (orderId, userId) => {
  const order = await Order.findOne({ orderId });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  if (order.userId !== userId) {
    throw Object.assign(new Error('Unauthorized to cancel this order'), { statusCode: 403 });
  }

  if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
    throw Object.assign(
      new Error(`Cannot cancel order with status ${order.orderStatus}`),
      { statusCode: 400 }
    );
  }

  return updateOrderStatus(orderId, 'CANCELLED');
};

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};
