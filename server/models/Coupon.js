const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true },
  discount:    { type: Number, required: true },  // percentage
  maxDiscount: { type: Number, default: 100 },    // max ₹ off
  minFare:     { type: Number, default: 0 },      // min fare to apply
  isActive:    { type: Boolean, default: true },
  usageLimit:  { type: Number, default: 100 },
  usedCount:   { type: Number, default: 0 },
  expiresAt:   { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);