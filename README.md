# E-Commerce Microservices Platform

A production-style microservices-based e-commerce web application built for college project demonstration. The system demonstrates real-world microservices architecture patterns including **Database per Service**, **API Gateway**, **Event-Driven Communication**, and **Containerization**.

---

## Architecture Overview

```
                                    ┌─────────────────┐
                                    │    Frontend     │
                                    │  React + Vite   │
                                    │   Port: 5173    │
                                    └────────┬────────┘
                                             │ HTTP
                                             ▼
                                    ┌─────────────────┐
                                    │   API Gateway   │
                                    │  JWT Auth +     │
                                    │  Request Router │
                                    │   Port: 3000    │
                                    └────────┬────────┘
                         ┌───────────────────┼───────────────────┐
                         │ REST              │ REST              │ REST
                         ▼                   ▼                   ▼
              ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
              │  Order Service   │ │ Payment Service  │ │Inventory Service │
              │   Port: 3001     │ │   Port: 3002     │ │   Port: 3003     │
              │  MongoDB (Order) │ │ MongoDB (Payment)│ │MongoDB (Inventory│
              └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
                       │                    │                    │
                       │         RabbitMQ Message Broker          │
                       │              (Port: 5672)                │
                       └────────────────────┼────────────────────┘
                                            │
                                            ▼
                                 ┌──────────────────┐
                                 │ Notification     │
                                 │ Service          │
                                 │ Port: 3004       │
                                 │ MongoDB (Notif.) │
                                 └──────────────────┘
```

---

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React.js, Vite, Tailwind CSS, Axios |
| Backend | Node.js, Express.js, JavaScript |
| Database | MongoDB (separate DB per service) |
| Message Broker | RabbitMQ |
| Authentication | JWT |
| Containerization | Docker, Docker Compose |

---

## Project Structure

```
ecommerce-microservices/
├── frontend/                    # React SPA
├── api-gateway/                 # API Gateway with JWT auth
├── services/
│   ├── order-service/           # Order management
│   ├── payment-service/         # Payment processing
│   ├── inventory-service/       # Product & stock management
│   └── notification-service/    # Event-driven notifications
├── docker-compose.yml           # Full stack orchestration
└── README.md
```

---

## Microservices Explanation

### 1. Order Service (Port 3001)
- **Purpose:** Manages customer orders lifecycle
- **Database:** `order_db` on `mongodb-order`
- **Communication:** REST to Inventory & Payment; RabbitMQ events for OrderCreated, OrderCancelled
- **Flow:** Check stock → Create order (PENDING) → Process payment → Update status → Publish events

### 2. Payment Service (Port 3002)
- **Purpose:** Simulates payment gateway processing
- **Database:** `payment_db` on `mongodb-payment`
- **Communication:** REST API; publishes `PaymentCompleted` via RabbitMQ
- **Features:** 95% simulated success rate, transaction ID generation

### 3. Inventory Service (Port 3003)
- **Purpose:** Product catalog and stock management
- **Database:** `inventory_db` on `mongodb-inventory`
- **Communication:** REST API; consumes `PaymentCompleted` to reduce stock
- **Features:** Pre-seeded products, stock validation, async stock reduction

### 4. Notification Service (Port 3004)
- **Purpose:** User notifications via event consumption
- **Database:** `notification_db` on `mongodb-notification`
- **Communication:** RabbitMQ consumer only (no direct calls from other services)
- **Events:** OrderCreated, PaymentCompleted, OrderCancelled
- **Features:** Email simulation (console logs), notification persistence

### 5. API Gateway (Port 3000)
- **Purpose:** Single entry point, authentication, routing
- **Features:** JWT auth, request proxying, API documentation endpoint
- **Demo User:** `demo@college.edu` / `password123`

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- OR Node.js 18+ and MongoDB locally for development

---

## Quick Start with Docker

```bash
# Clone/navigate to project
cd ecommerce-microservices

# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up --build -d
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3000 |
| API Documentation | http://localhost:3000/api/docs |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |

### Demo Login

```
Email: demo@college.edu
Password: password123
```

---

## Local Development (Without Docker)

### 1. Start MongoDB & RabbitMQ
Ensure MongoDB instances and RabbitMQ are running locally.

### 2. Start Each Service

```bash
# Terminal 1 - Inventory Service
cd services/inventory-service
cp .env.example .env
npm install && npm run dev

# Terminal 2 - Payment Service
cd services/payment-service
cp .env.example .env
npm install && npm run dev

# Terminal 3 - Order Service
cd services/order-service
cp .env.example .env
npm install && npm run dev

# Terminal 4 - Notification Service
cd services/notification-service
cp .env.example .env
npm install && npm run dev

# Terminal 5 - API Gateway
cd api-gateway
cp .env.example .env
npm install && npm run dev

# Terminal 6 - Frontend
cd frontend
cp .env.example .env
npm install && npm run dev
```

Update `.env` files to use `localhost` instead of Docker service names.

---

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "demo@college.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "userId": "USER001", "name": "Demo Student", "email": "demo@college.edu" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Inventory (Public)

#### Get All Products
```http
GET /api/inventory/products
```

#### Get Product by ID
```http
GET /api/inventory/products/PROD001
```

#### Check Stock
```http
GET /api/inventory/check/PROD001?quantity=2
```

### Orders (Auth Required)
Include header: `Authorization: Bearer <token>`

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "products": [
    { "productId": "PROD001", "quantity": 1 },
    { "productId": "PROD003", "quantity": 2 }
  ],
  "paymentMethod": "CREDIT_CARD"
}
```

#### Get My Orders
```http
GET /api/orders/my-orders
Authorization: Bearer <token>
```

#### Get Order by ID
```http
GET /api/orders/ORD12345678
Authorization: Bearer <token>
```

#### Cancel Order
```http
PUT /api/orders/ORD12345678/cancel
Authorization: Bearer <token>
```

### Notifications (Auth Required)

#### Get My Notifications
```http
GET /api/notifications/my-notifications
Authorization: Bearer <token>
```

---

## Order Flow Sequence

```
Customer → Frontend → API Gateway → Order Service
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
            Inventory Service    Payment Service      RabbitMQ
            (Check Stock)        (Process Payment)    (OrderCreated)
                    │                   │                   │
                    │                   ▼                   ▼
                    │            RabbitMQ              Notification
                    │         (PaymentCompleted)         Service
                    ▼                   │                   │
            Inventory Service ◄─────────┘                   │
            (Reduce Stock)                                  │
                                                            ▼
                                                    Email Simulation
                                                    + DB Log
```

---

## RabbitMQ Events

| Event | Routing Key | Publisher | Consumer(s) |
|-------|-------------|-----------|-------------|
| OrderCreated | `order.created` | Order Service | Notification Service |
| PaymentCompleted | `payment.completed` | Payment Service | Inventory, Notification |
| OrderCancelled | `order.cancelled` | Order Service | Notification Service |

---

## Health Checks

```bash
curl http://localhost:3000/health   # API Gateway
curl http://localhost:3001/health   # Order Service
curl http://localhost:3002/health   # Payment Service
curl http://localhost:3003/health   # Inventory Service
curl http://localhost:3004/health   # Notification Service
```

---

## Stopping Services

```bash
docker-compose down

# Remove volumes (reset databases)
docker-compose down -v
```

---

## College Demo Tips

1. **Show Architecture:** Open README diagram and explain Database-per-Service pattern
2. **Place Order:** Login → Add products → Checkout → Watch RabbitMQ management UI
3. **Show Events:** Check notification-service logs for email simulations
4. **Show Independence:** Stop one service and show graceful error handling
5. **API Docs:** Visit http://localhost:3000/api/docs

---

## License

MIT — Built for educational purposes.
