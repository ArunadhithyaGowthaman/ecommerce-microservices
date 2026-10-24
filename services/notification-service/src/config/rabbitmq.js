const amqp = require('amqplib');
const notificationService = require('../services/notification.service');
const logger = require('../../logger');

const EXCHANGE = 'ecommerce.events';

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

    const events = [
      { queue: 'notification.order.created', routingKey: 'order.created', handler: notificationService.handleOrderCreated },
      { queue: 'notification.payment.completed', routingKey: 'payment.completed', handler: notificationService.handlePaymentCompleted },
      { queue: 'notification.order.cancelled', routingKey: 'order.cancelled', handler: notificationService.handleOrderCancelled }
    ];

    for (const event of events) {
      const q = await channel.assertQueue(event.queue, { durable: true });
      await channel.bindQueue(q.queue, EXCHANGE, event.routingKey);

      channel.consume(q.queue, async (msg) => {
        if (!msg) return;
        try {
          const data = JSON.parse(msg.content.toString());
          logger.info(`[Notification Service] Received ${data.eventType || event.routingKey}`);
          await event.handler(data);
          channel.ack(msg);
        } catch (error) {
          logger.error(`[Notification Service] Error processing ${event.routingKey}`, { error: error.message });
          channel.nack(msg, false, false);
        }
      });
    }

    logger.info('[Notification Service] RabbitMQ consumer started for all events');
  } catch (error) {
    logger.error('[Notification Service] RabbitMQ connection error', { error: error.message });
  }
};

module.exports = { connectRabbitMQ };
