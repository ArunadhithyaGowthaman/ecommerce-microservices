const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Inventory Service] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('[Inventory Service] MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
