const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const Payment = require('../models/Payment');
const { calculateFare,calculateArrival, generateOTP } = require('../config/fareConfig');

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
const bookRide = async (req, res) => {
  try {
    const {
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      cabType,
      distanceKm,
      durationMin
    } = req.body;

    // Validate fields
    if (!pickupAddress || !dropoffAddress || !cabType) {
      return res.status(400).json({
        success: false,
        message: 'Pickup, dropoff and cab type are required'
      });
    }

    // Calculate fare
    const estimatedFare = calculateFare(
      cabType,
      distanceKm || 5,
      durationMin || 15
    );

    // Generate OTP
    const otp = generateOTP();

    // Find available driver (nearest - simplified)
    const availableDriver = await Driver.findOne({
      isAvailable: true,
      isVerified: true,
      'vehicle.type': cabType
    });

    // Create ride
    const ride = await Ride.create({
      user: req.user.id,
      driver: availableDriver ? availableDriver._id : null,
      pickup: {
        address: pickupAddress,
        lat: pickupLat || 0,
        lng: pickupLng || 0
      },
      dropoff: {
        address: dropoffAddress,
        lat: dropoffLat || 0,
        lng: dropoffLng || 0
      },
      cabType,
      status: availableDriver ? 'accepted' : 'requested',
      fare: { estimated: estimatedFare },
      distance: distanceKm || 5,
      duration: durationMin || 15,
      otp
    });

    // Mark driver as unavailable
    if (availableDriver) {
      await Driver.findByIdAndUpdate(
        availableDriver._id,
        { isAvailable: false }
      );
    }

    res.status(201).json({
      success: true,
      message: availableDriver
        ? '🚕 Ride booked! Driver assigned.'
        : '🔍 Ride requested. Finding driver...',
      ride: {
        id: ride._id,
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        cabType: ride.cabType,
        status: ride.status,
        estimatedFare,
        otp: ride.otp,
        driver: availableDriver
          ? {
              name: availableDriver.name,
              phone: availableDriver.phone,
              vehicle: availableDriver.vehicle,
              rating: availableDriver.rating
            }
          : null
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

module.exports = {
  estimateFare,
  bookRide,
  getRideStatus,
  updateRideStatus,
  cancelRide,
  getRideHistory,
  rateRide
};