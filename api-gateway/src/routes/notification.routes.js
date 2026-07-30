const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const proxy = require('../controllers/proxy.controller');

router.get('/my-notifications', authenticate, proxy.getUserNotifications);

module.exports = router;
