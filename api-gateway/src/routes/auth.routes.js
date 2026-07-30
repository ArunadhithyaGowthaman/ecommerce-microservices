const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../middleware/validation');

router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const result = await authController.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const result = await authController.login(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
