const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const proxy = require('../controllers/proxy.controller');
const axios = require('axios');

router.post('/', authenticate, proxy.createOrder);
router.get('/my-orders', authenticate, proxy.getUserOrders);
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const response = await axios.get(`${proxy.ORDER_URL}/api/orders/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});
router.put('/:id/cancel', authenticate, proxy.cancelOrder);
router.put('/:id/status', authenticate, async (req, res, next) => {
  try {
    const response = await axios.put(`${proxy.ORDER_URL}/api/orders/${req.params.id}/status`, req.body);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
