const express = require('express');
const router = express.Router();
const proxy = require('../controllers/proxy.controller');
const axios = require('axios');

router.get('/products', async (req, res, next) => {
  try {
    const response = await axios.get(`${proxy.INVENTORY_URL}/api/inventory/products`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/products/:productId', async (req, res, next) => {
  try {
    const response = await axios.get(`${proxy.INVENTORY_URL}/api/inventory/products/${req.params.productId}`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/check/:productId', async (req, res, next) => {
  try {
    const response = await axios.get(`${proxy.INVENTORY_URL}/api/inventory/check/${req.params.productId}`, {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
