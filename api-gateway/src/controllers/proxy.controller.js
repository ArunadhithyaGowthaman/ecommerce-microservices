const axios = require('axios');

const ORDER_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001';
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3002';
const INVENTORY_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003';
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';

const proxyRequest = async (baseUrl, req, res, next) => {
  try {
    const url = `${baseUrl}${req.originalUrl.replace(/^\/api/, '/api')}`;
    const config = {
      method: req.method,
      url,
      data: req.body,
      params: req.query,
      headers: { 'Content-Type': 'application/json' }
    };

    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    req.body.userId = req.user.userId;
    const response = await axios.post(`${ORDER_URL}/api/orders`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const response = await axios.get(`${ORDER_URL}/api/orders/user/${req.user.userId}`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const response = await axios.put(`${ORDER_URL}/api/orders/${req.params.id}/cancel`, {
      userId: req.user.userId
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

const getUserNotifications = async (req, res, next) => {
  try {
    const response = await axios.get(`${NOTIFICATION_URL}/api/notifications/user/${req.user.userId}`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  proxyRequest,
  createOrder,
  getUserOrders,
  cancelOrder,
  getUserNotifications,
  ORDER_URL,
  PAYMENT_URL,
  INVENTORY_URL,
  NOTIFICATION_URL
};
