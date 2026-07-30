const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  orderId: { type: String, default: null },
  message: { type: String, required: true },
  type: { type: String, enum: ['ORDER_CREATED', 'PAYMENT_SUCCESS', 'ORDER_CANCELLED'], required: true },
  status: { type: String, enum: ['SENT', 'FAILED', 'PENDING'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
