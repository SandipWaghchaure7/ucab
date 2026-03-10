const express = require('express');
const router  = express.Router();
const { createPayment, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/pay',           protect, createPayment);
router.get('/status/:rideId', protect, getPaymentStatus);

module.exports = router;