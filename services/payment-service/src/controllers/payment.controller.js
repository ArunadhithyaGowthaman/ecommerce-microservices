const paymentService = require('../services/payment.service');

const processPayment = async (req, res, next) => {
  try {
    const result = await paymentService.processPayment(req.body);
    const statusCode = result.status === 'SUCCESS' ? 200 : 402;
    res.status(statusCode).json({ success: result.status === 'SUCCESS', data: result });
  } catch (error) {
    next(error);
  }
};

const getPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const getPaymentsByOrder = async (req, res, next) => {
  try {
    const payments = await paymentService.getPaymentsByOrderId(req.params.orderId);
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

module.exports = { processPayment, getPayment, getPaymentsByOrder };
