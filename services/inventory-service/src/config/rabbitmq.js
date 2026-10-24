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

    const queue = await channel.assertQueue('inventory.payment.completed', { durable: true });
    await channel.bindQueue(queue.queue, EXCHANGE, 'payment.completed');

    channel.consume(queue.queue, async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        const { handlePaymentCompleted } = require('../services/inventory.service');
        await handlePaymentCompleted(event);
        channel.ack(msg);
      } catch (error) {
        logger.error('[Inventory Service] Error processing message', { error: error.message });
        channel.nack(msg, false, false);
      }
    });

    logger.info('[Inventory Service] RabbitMQ connected and listening for payment.completed');
  } catch (error) {
    logger.error('[Inventory Service] RabbitMQ connection error', { error: error.message });
  }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel, EXCHANGE };