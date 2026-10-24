const mongoose = require('mongoose');
const logger = require('../../logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`[Inventory Service] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('[Inventory Service] MongoDB connection error', { error: error.message });
    process.exit(1);
  }
};

module.exports = connectDB;