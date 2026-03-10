const Coupon = require('../models/Coupon');

// ── VALIDATE COUPON ───────────────────────────────────
const validateCoupon = async (req, res) => {
  try {
    const { code, fare } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon code'
      });
    }

    // Check expiry
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired'
      });
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }

    // Check minimum fare
    if (fare && fare < coupon.minFare) {
      return res.status(400).json({
        success: false,
        message: `Minimum fare of ₹${coupon.minFare} required for this coupon`
      });
    }

    // Calculate discount
    const discountAmount = Math.min(
      Math.round((fare * coupon.discount) / 100),
      coupon.maxDiscount
    );
    const finalFare = Math.max(fare - discountAmount, 0);

    res.status(200).json({
      success: true,
      message: `Coupon applied! You save ₹${discountAmount}`,
      coupon: {
        code:           coupon.code,
        discount:       coupon.discount,
        discountAmount,
        finalFare,
        originalFare:   fare
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── APPLY COUPON (increment usage) ───────────────────
const applyCoupon = async (code) => {
  await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    { $inc: { usedCount: 1 } }
  );
};

module.exports = { validateCoupon, applyCoupon };