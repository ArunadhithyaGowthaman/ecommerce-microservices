require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { connectRabbitMQ } = require('./src/config/rabbitmq');
const orderRoutes = require('./src/routes/order.routes');
const errorHandler = require('./src/middleware/errorHandler');
const { register, metricsMiddleware } = require('./metrics');   // ← NEW
const logger = require('./logger');                              // ← NEW

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);   // ← NEW

app.get('/health', (req, res) => {
  res.json({ service: 'order-service', status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/metrics', async (req, res) => {   // ← NEW
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/orders', orderRoutes);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  await connectRabbitMQ();
  app.listen(PORT, () => {
    logger.info(`Order Service running on port ${PORT}`);   // ← CHANGED
  });
};

start();