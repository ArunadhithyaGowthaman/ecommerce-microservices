const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true, enum: ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING'] },
  paymentStatus: { type: String, required: true, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  transactionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
