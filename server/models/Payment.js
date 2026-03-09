const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: ''
  },
  paidAt: {
    type: Date
  },
  receipt: {
    type: String       // receipt URL or ID
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);