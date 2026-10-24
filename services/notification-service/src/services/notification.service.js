const { v4: uuidv4 } = require('uuid');
const Notification = require('../models/Notification');
const logger = require('../../logger');

const simulateEmailSend = async (userId, message) => {
  logger.info('========================================');
  logger.info('[EMAIL SIMULATION]');
  logger.info(`To: user-${userId}@example.com`);
  logger.info(`Subject: E-Commerce Notification`);
  logger.info(`Body: ${message}`);
  logger.info('========================================');
  return true;
};

const createNotification = async ({ userId, orderId, message, type }) => {
  const notificationId = `NOTIF${uuidv4().slice(0, 8).toUpperCase()}`;

  const notification = new Notification({
    notificationId,
    userId,
    orderId,
    message,
    type,
    status: 'PENDING'
  });
  await notification.save();

  try {
    await simulateEmailSend(userId, message);
    notification.status = 'SENT';
  } catch {
    notification.status = 'FAILED';
  }
  await notification.save();

  return notification;
};

const handleOrderCreated = async (event) => {
  const message = `Your order ${event.orderId} has been confirmed successfully. Total amount: $${event.totalAmount.toFixed(2)}.`;
  return createNotification({
    userId: event.userId,
    orderId: event.orderId,
    message,
    type: 'ORDER_CREATED'
  });
};

const handlePaymentCompleted = async (event) => {
  const message = `Payment of $${event.amount.toFixed(2)} for order ${event.orderId} was successful. Payment ID: ${event.paymentId}.`;
  return createNotification({
    userId: event.userId,
    orderId: event.orderId,
    message,
    type: 'PAYMENT_SUCCESS'
  });
};

const handleOrderCancelled = async (event) => {
  const message = `Your order ${event.orderId} has been cancelled. Refund of $${event.totalAmount.toFixed(2)} will be processed within 5-7 business days.`;
  return createNotification({
    userId: event.userId,
    orderId: event.orderId,
    message,
    type: 'ORDER_CANCELLED'
  });
};

const getNotificationsByUserId = async (userId) => {
  return Notification.find({ userId }).sort({ createdAt: -1 });
};

const getAllNotifications = async () => {
  return Notification.find().sort({ createdAt: -1 });
};

module.exports = {
  handleOrderCreated,
  handlePaymentCompleted,
  handleOrderCancelled,
  getNotificationsByUserId,
  getAllNotifications
};
