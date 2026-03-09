const express = require('express');
const router = express.Router();
const {
  estimateFare,
  bookRide,
  getRideStatus,
  updateRideStatus,
  cancelRide,
  getRideHistory,
  rateRide
} = require('../controllers/rideController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// ── Fare & Booking ──
router.post('/estimate',            estimateFare);
router.post('/book',                bookRide);

// ── Ride Management ──
router.get('/history',              getRideHistory);
router.get('/:id',                  getRideStatus);
router.put('/:id/status',           updateRideStatus);
router.put('/:id/cancel',           cancelRide);
router.post('/:id/rate',            rateRide);

module.exports = router;