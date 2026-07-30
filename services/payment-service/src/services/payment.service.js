const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const { publishEvent } = require('../config/rabbitmq');

const simulatePaymentGateway = (amount) => {
  // Simulate 95% success rate for demo
  const success = Math.random() > 0.05;
  return {
    success,
    transactionRef: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
    message: success ? 'Payment processed successfully' : 'Payment declined by gateway'
  };
};

const processPayment = async ({ orderId, userId, amount, paymentMethod, products }) => {
  const paymentId = `PAY${uuidv4().slice(0, 8).toUpperCase()}`;

  const payment = new Payment({
    paymentId,
    orderId,
    userId,
    amount,
    paymentMethod,
    paymentStatus: 'PENDING'
  });
  await payment.save();

  const gatewayResult = simulatePaymentGateway(amount);

  if (gatewayResult.success) {
    payment.paymentStatus = 'SUCCESS';
    payment.transactionDate = new Date();
    await payment.save();

    await publishEvent('payment.completed', {
      eventType: 'PaymentCompleted',
      paymentId,
      orderId,
      userId,
      amount,
      paymentMethod,
      products,
      status: 'SUCCESS',
      timestamp: new Date().toISOString()
    });

    return { paymentId, status: 'SUCCESS', message: gatewayResult.message };
  }

  payment.paymentStatus = 'FAILED';
  await payment.save();

  return { paymentId, status: 'FAILED', message: gatewayResult.message };
};

const getPaymentById = async (paymentId) => {
  return Payment.findOne({ paymentId });
};

const getPaymentsByOrderId = async (orderId) => {
  return Payment.find({ orderId });
};

const getAllPayments = async () => {
  return Payment.find().sort({ transactionDate: -1 });
};

module.exports = {
  processPayment,
  getPaymentById,
  getPaymentsByOrderId,
  getAllPayments
};
