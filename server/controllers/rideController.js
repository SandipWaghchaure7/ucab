const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const Payment = require('../models/Payment');
const { calculateFare,calculateArrival, generateOTP } = require('../config/fareConfig');
const { applyCoupon } = require('./couponController');

// ─── ESTIMATE FARE ─────────────────────────────────────────
const estimateFare = async (req, res) => {
  try {
    const { cabType, distanceKm, durationMin } = req.body;

    if (!distanceKm) {
      return res.status(400).json({
        success: false,
        message: 'distanceKm is required'
      });
    }

    const allTypes = ['Mini', 'Sedan', 'SUV', 'Auto'];
    const estimates = {};

    allTypes.forEach(type => {
      // Random driver distance 1–5 km away
      const driverDist = Math.random() * 4 + 1;
      estimates[type] = {
        fare:    calculateFare(type, distanceKm, durationMin || 10),
        arrival: calculateArrival(type, driverDist),
        // Available drivers count (random 1-5)
        drivers: Math.floor(Math.random() * 5) + 1
      };
    });

    // Filter to requested type or return all
    const result = cabType === 'all'
      ? estimates
      : { [cabType]: estimates[cabType] };

    res.status(200).json({
      success: true,
      distanceKm,
      durationMin: durationMin || 10,
      estimates: result
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── BOOK RIDE ─────────────────────────────────────────────
// Inside bookRide(), update fare calculation:
const bookRide = async (req, res) => {
  try {
    const {
      pickupAddress, pickupLat, pickupLng,
      dropoffAddress, dropoffLat, dropoffLng,
      cabType, distanceKm, durationMin,
      couponCode  // ← NEW
    } = req.body;

    if (!pickupAddress || !dropoffAddress || !cabType) {
      return res.status(400).json({
        success: false,
        message: 'Pickup, dropoff and cab type are required'
      });
    }

    let estimatedFare = calculateFare(cabType, distanceKm || 5, durationMin || 15);
    let discountAmount = 0;
    let appliedCoupon  = null;

    // ── Apply coupon if provided ──────────────────────
    if (couponCode) {
      const Coupon = require('../models/Coupon');
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true
      });
      if (coupon && coupon.usedCount < coupon.usageLimit) {
        discountAmount = Math.min(
          Math.round((estimatedFare * coupon.discount) / 100),
          coupon.maxDiscount
        );
        estimatedFare  = Math.max(estimatedFare - discountAmount, 0);
        appliedCoupon  = coupon.code;
        await applyCoupon(couponCode);
      }
    }

    const otp = generateOTP();

    const availableDriver = await Driver.findOne({
      isAvailable: true,
      isVerified:  true,
      'vehicle.type': cabType
    });

    const ride = await Ride.create({
      user: req.user.id,
      driver: availableDriver ? availableDriver._id : null,
      pickup:  { address: pickupAddress,  lat: pickupLat  || 0, lng: pickupLng  || 0 },
      dropoff: { address: dropoffAddress, lat: dropoffLat || 0, lng: dropoffLng || 0 },
      cabType,
      status: availableDriver ? 'accepted' : 'requested',
      fare:   { estimated: estimatedFare },
      distance: distanceKm || 5,
      duration: durationMin || 15,
      otp
    });

    if (availableDriver) {
      await Driver.findByIdAndUpdate(availableDriver._id, { isAvailable: false });
    }

    res.status(201).json({
      success: true,
      message: availableDriver
        ? '🚕 Ride booked! Driver assigned.'
        : '🔍 Ride requested. Finding driver...',
      ride: {
        id: ride._id,
        pickup:  ride.pickup,
        dropoff: ride.dropoff,
        cabType: ride.cabType,
        status:  ride.status,
        estimatedFare,
        discountAmount,   // ← NEW
        appliedCoupon,    // ← NEW
        otp: ride.otp,
        driver: availableDriver ? {
          name:    availableDriver.name,
          phone:   availableDriver.phone,
          vehicle: availableDriver.vehicle,
          rating:  availableDriver.rating
        } : null
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── GET RIDE STATUS ───────────────────────────────────────
const getRideStatus = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name phone vehicle rating location')
      .populate('user', 'name phone');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check ownership
    if (ride.user._id.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ride'
      });
    }

    res.status(200).json({ success: true, ride });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── UPDATE RIDE STATUS (Driver) ───────────────────────────
const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      'accepted', 'arriving', 'ongoing', 'completed', 'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Update ride status
    ride.status = status;

    // If completed → set final fare & free driver
    if (status === 'completed') {
      ride.fare.final = ride.fare.estimated;
      ride.paymentStatus = 'pending';

      // Free driver
      if (ride.driver) {
        await Driver.findByIdAndUpdate(ride.driver, {
          isAvailable: true,
          $inc: { totalRides: 1, earnings: ride.fare.estimated }
        });
      }

      // Create payment record
      await Payment.create({
        ride: ride._id,
        user: ride.user,
        driver: ride.driver,
        amount: ride.fare.final,
        method: 'cash',
        status: 'pending'
      });
    }

    // If cancelled → free driver
    if (status === 'cancelled') {
      if (ride.driver) {
        await Driver.findByIdAndUpdate(ride.driver, {
          isAvailable: true
        });
      }
    }

    await ride.save();

    res.status(200).json({
      success: true,
      message: `Ride status updated to ${status}`,
      ride: {
        id: ride._id,
        status: ride.status,
        fare: ride.fare
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── CANCEL RIDE ───────────────────────────────────────────
const cancelRide = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Can only cancel if not ongoing/completed
    if (['ongoing', 'completed'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an ongoing or completed ride'
      });
    }

    ride.status = 'cancelled';
    ride.cancelReason = cancelReason || 'Cancelled by user';

    // Free driver
    if (ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver, {
        isAvailable: true
      });
    }

    await ride.save();

    res.status(200).json({
      success: true,
      message: '🚫 Ride cancelled successfully',
      ride: {
        id: ride._id,
        status: ride.status,
        cancelReason: ride.cancelReason
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── RIDE HISTORY ──────────────────────────────────────────
const getRideHistory = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user.id })
      .populate('driver', 'name phone vehicle rating')
      .sort({ createdAt: -1 });  // Latest first

    res.status(200).json({
      success: true,
      totalRides: rides.length,
      rides
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── RATE RIDE ─────────────────────────────────────────────
const rateRide = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed rides'
      });
    }

    ride.rating = { userRating: rating, comment };
    await ride.save();

    // Update driver average rating
    if (ride.driver) {
      const driver = await Driver.findById(ride.driver);
      const allRides = await Ride.find({
        driver: ride.driver,
        'rating.userRating': { $exists: true }
      });

      const avgRating =
        allRides.reduce((sum, r) => sum + r.rating.userRating, 0) /
        allRides.length;

      await Driver.findByIdAndUpdate(ride.driver, {
        rating: Math.round(avgRating * 10) / 10
      });
    }

    res.status(200).json({
      success: true,
      message: '⭐ Ride rated successfully',
      rating: ride.rating
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ── GET PENDING RIDES (for driver) ───────────────────
const getDriverPendingRides = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id);
    if (!driver)
      return res.status(404).json({ success: false, message: 'Driver not found' });

    // Find rides matching driver cab type that are still requested
    const rides = await Ride.find({
      status:  'requested',
      cabType: driver.vehicle.type
    }).populate('user', 'name phone').sort({ createdAt: -1 });

    res.status(200).json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET DRIVER ACTIVE RIDE ────────────────────────────
const getDriverActiveRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      driver: req.user.id,
      status: { $in: ['accepted', 'arriving', 'ongoing'] }
    }).populate('user', 'name phone email');

    res.status(200).json({ success: true, ride: ride || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET DRIVER RIDE HISTORY ───────────────────────────
const getDriverRideHistory = async (req, res) => {
  try {
    const rides = await Ride.find({
      driver: req.user.id,
      status: { $in: ['completed', 'cancelled'] }
    }).populate('user', 'name phone').sort({ createdAt: -1 });

    const totalEarnings = rides
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.fare.final || r.fare.estimated || 0), 0);

    res.status(200).json({
      success: true,
      totalRides: rides.length,
      totalEarnings,
      rides
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── ACCEPT RIDE ───────────────────────────────────────
const acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride)
      return res.status(404).json({ success: false, message: 'Ride not found' });

    if (ride.status !== 'requested')
      return res.status(400).json({ success: false, message: 'Ride is no longer available' });

    // Assign driver to ride
    ride.driver = req.user.id;
    ride.status = 'accepted';
    await ride.save();

    // Mark driver as unavailable
    await Driver.findByIdAndUpdate(req.user.id, { isAvailable: false });

    const updatedRide = await Ride.findById(ride._id)
      .populate('user', 'name phone email');

    res.status(200).json({
      success: true,
      message: '✅ Ride accepted!',
      ride: updatedRide
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── REJECT RIDE ───────────────────────────────────────
const rejectRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride)
      return res.status(404).json({ success: false, message: 'Ride not found' });

    res.status(200).json({
      success: true,
      message: 'Ride rejected'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── TOGGLE DRIVER AVAILABILITY ────────────────────────
const toggleAvailability = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id);
    if (!driver)
      return res.status(404).json({ success: false, message: 'Driver not found' });

    driver.isAvailable = !driver.isAvailable;
    await driver.save();

    res.status(200).json({
      success: true,
      message: driver.isAvailable ? '🟢 You are now Online' : '🔴 You are now Offline',
      isAvailable: driver.isAvailable
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  estimateFare,
  bookRide,
  getRideStatus,
  updateRideStatus,
  cancelRide,
  getRideHistory,
  rateRide,
  getDriverPendingRides,   // ← ADD
  getDriverActiveRide,     // ← ADD
  getDriverRideHistory,    // ← ADD
  acceptRide,              // ← ADD
  rejectRide,              // ← ADD
  toggleAvailability,      // ← ADD
};