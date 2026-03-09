const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  registerDriver, 
  loginDriver,
  getProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ── User Routes ──
router.post('/user/register', registerUser);
router.post('/user/login',    loginUser);

// ── Driver Routes ──
router.post('/driver/register', registerDriver);
router.post('/driver/login',    loginDriver);

// ── Protected Route ──
router.get('/profile', protect, getProfile);

module.exports = router;