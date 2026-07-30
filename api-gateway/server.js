require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth.routes');
const orderRoutes = require('./src/routes/order.routes');
const inventoryRoutes = require('./src/routes/inventory.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const errorHandler = require('./src/middleware/errorHandler');
const { seedDemoUser } = require('./src/controllers/auth.controller');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      order: process.env.ORDER_SERVICE_URL,
      payment: process.env.PAYMENT_SERVICE_URL,
      inventory: process.env.INVENTORY_SERVICE_URL,
      notification: process.env.NOTIFICATION_SERVICE_URL
    }
  });
});

app.get('/api/docs', (req, res) => {
  res.json({
    title: 'E-Commerce Microservices API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login and receive JWT token'
      },
      inventory: {
        'GET /api/inventory/products': 'List all products',
        'GET /api/inventory/products/:productId': 'Get product details',
        'GET /api/inventory/check/:productId?quantity=1': 'Check stock availability'
      },
      orders: {
        'POST /api/orders': 'Create order (Auth required)',
        'GET /api/orders/my-orders': 'Get user orders (Auth required)',
        'GET /api/orders/:id': 'Get order by ID (Auth required)',
        'PUT /api/orders/:id/cancel': 'Cancel order (Auth required)'
      },
      notifications: {
        'GET /api/notifications/my-notifications': 'Get user notifications (Auth required)'
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const start = async () => {
  await seedDemoUser();
  app.listen(PORT, () => {
    console.log(`[API Gateway] Running on port ${PORT}`);
    console.log(`[API Gateway] API docs available at http://localhost:${PORT}/api/docs`);
  });
};

start();
