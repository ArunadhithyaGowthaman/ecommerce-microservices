require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { connectRabbitMQ } = require('./src/config/rabbitmq');
const orderRoutes = require('./src/routes/order.routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ service: 'order-service', status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/orders', orderRoutes);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  await connectRabbitMQ();
  app.listen(PORT, () => {
    console.log(`[Order Service] Running on port ${PORT}`);
  });
};

start();
