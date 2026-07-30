const notificationService = require('../services/notification.service');

const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotificationsByUserId(req.params.userId);
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getAllNotifications();
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserNotifications, getAllNotifications };
