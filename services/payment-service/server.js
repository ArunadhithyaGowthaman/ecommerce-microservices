require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { connectRabbitMQ } = require('./src/config/rabbitmq');
const paymentRoutes = require('./src/routes/payment.routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ service: 'payment-service', status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/payment', paymentRoutes);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  await connectRabbitMQ();
  app.listen(PORT, () => {
    console.log(`[Payment Service] Running on port ${PORT}`);
  });
};

start();
