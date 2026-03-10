const express = require('express');
const router = express.Router();
const {
  estimateFare,
  bookRide,
  getRideStatus,
  updateRideStatus,
  cancelRide,
  getRideHistory,
  rateRide,
  getDriverPendingRides,
  getDriverActiveRide,
  getDriverRideHistory,
  acceptRide,
  rejectRide,
  toggleAvailability,
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

// ── Driver specific routes ────────────────────────────
router.get('/driver/pending',           protect, getDriverPendingRides);
router.get('/driver/active',            protect, getDriverActiveRide);
router.get('/driver/history',           protect, getDriverRideHistory);
router.put('/:id/accept',               protect, acceptRide);
router.put('/:id/reject',               protect, rejectRide);
router.put('/driver/availability',      protect, toggleAvailability);

module.exports = router;