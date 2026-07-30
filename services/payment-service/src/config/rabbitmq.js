const amqp = require('amqplib');

let channel = null;
let connection = null;

const EXCHANGE = 'ecommerce.events';

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    console.log('[Payment Service] RabbitMQ connected');
  } catch (error) {
    console.error('[Payment Service] RabbitMQ connection error:', error.message);
  }
};

const publishEvent = async (routingKey, event) => {
  if (!channel) {
    console.warn('[Payment Service] RabbitMQ channel not available, skipping publish');
    return;
  }
  channel.publish(
    EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );
  console.log(`[Payment Service] Published event: ${routingKey}`);
};

module.exports = { connectRabbitMQ, publishEvent, EXCHANGE };
