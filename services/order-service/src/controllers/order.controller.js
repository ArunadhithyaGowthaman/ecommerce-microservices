const orderService = require('../services/order.service');

const createOrder = async (req, res, next) => {
  try {
    const result = await orderService.createOrder(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUserId(req.params.userId);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.body.userId);
    res.json({ success: true, data: order, message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrder,
  getUserOrders,
  getAllOrders,
  updateStatus,
  cancelOrder
};
