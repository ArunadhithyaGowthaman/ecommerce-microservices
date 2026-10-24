const amqp = require('amqplib');
const logger = require('../../logger');

let channel = null;
let connection = null;

const EXCHANGE = 'ecommerce.events';

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    logger.info('[Payment Service] RabbitMQ connected');
  } catch (error) {
    logger.error('[Payment Service] RabbitMQ connection error', { error: error.message });
  }
};

const publishEvent = async (routingKey, event) => {
  if (!channel) {
    logger.warn('[Payment Service] RabbitMQ channel not available, skipping publish');
    return;
  }
  channel.publish(
    EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );
  logger.info(`[Payment Service] Published event: ${routingKey}`);
};

module.exports = { connectRabbitMQ, publishEvent, EXCHANGE };