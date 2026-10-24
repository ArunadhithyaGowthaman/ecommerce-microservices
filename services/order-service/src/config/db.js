const mongoose = require('mongoose');
const logger = require('../../logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`[Order Service] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('[Order Service] MongoDB connection error', { error: error.message });
    process.exit(1);
  }
};

module.exports = connectDB;
