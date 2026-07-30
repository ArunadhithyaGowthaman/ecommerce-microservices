require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { connectRabbitMQ } = require('./src/config/rabbitmq');
const notificationRoutes = require('./src/routes/notification.routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ service: 'notification-service', status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/notifications', notificationRoutes);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  await connectRabbitMQ();
  app.listen(PORT, () => {
    console.log(`[Notification Service] Running on port ${PORT}`);
  });
};

start();
