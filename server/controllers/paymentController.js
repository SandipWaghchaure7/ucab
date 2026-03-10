const Payment = require('../models/Payment');
const Ride    = require('../models/Ride');

// ── CREATE PAYMENT ────────────────────────────────────
const createPayment = async (req, res) => {
  try {
    const { rideId, method } = req.body;

    if (!rideId || !method) {
      return res.status(400).json({
        success: false,
        message: 'Ride ID and payment method are required'
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This ride is already paid'
      });
    }

    const amount        = ride.fare.final || ride.fare.estimated;
    const transactionId = `UCAB${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create payment record
    const payment = await Payment.create({
      ride:          rideId,
      user:          req.user.id,
      driver:        ride.driver,
      amount,
      method,
      status:        'success',
      transactionId,
      paidAt:        new Date()
    });

    // Update ride payment status
    await Ride.findByIdAndUpdate(rideId, { paymentStatus: 'paid' });

    const messages = {
      cash:   '💵 Cash payment confirmed!',
      upi:    '📱 UPI payment successful!',
      card:   '💳 Card payment successful!',
      wallet: '👛 Wallet payment successful!'
    };

    res.status(200).json({
      success: true,
      message: messages[method] || '✅ Payment successful!',
      payment: {
        id:            payment._id,
        amount,
        method,
        transactionId,
        paidAt:        payment.paidAt
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET PAYMENT STATUS ────────────────────────────────
const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ ride: req.params.rideId })
      .populate('ride', 'pickup dropoff fare cabType');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({ success: true, payment });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPayment, getPaymentStatus };