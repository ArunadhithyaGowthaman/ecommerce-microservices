require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { connectRabbitMQ } = require('./src/config/rabbitmq');
const inventoryRoutes = require('./src/routes/inventory.routes');
const errorHandler = require('./src/middleware/errorHandler');
const { seedProducts } = require('./src/services/inventory.service');
const { register, metricsMiddleware } = require('./metrics');   // ← NEW
const logger = require('./logger');                              // ← NEW

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);   // ← NEW — must come before your routes so it can time every request

app.get('/health', (req, res) => {
  res.json({ service: 'inventory-service', status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/metrics', async (req, res) => {   // ← NEW
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/inventory', inventoryRoutes);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  await seedProducts();
  await connectRabbitMQ();
  app.listen(PORT, () => {
    logger.info(`Inventory Service running on port ${PORT}`);   // ← CHANGED from console.log
  });
};

start();