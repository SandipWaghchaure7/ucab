const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  pickup: {
    address: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number }
  },
  dropoff: {
    address: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number }
  },
  cabType: {
    type: String,
    enum: ['Mini', 'Sedan', 'SUV', 'Auto'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'requested',    // User booked
      'accepted',     // Driver accepted
      'arriving',     // Driver on the way
      'ongoing',      // Ride in progress
      'completed',    // Ride done
      'cancelled'     // Ride cancelled
    ],
    default: 'requested'
  },
  fare: {
    estimated: { type: Number },      // shown before ride
    final: { type: Number }           // confirmed after ride
  },
  distance: {
    type: Number,                     // in kilometers
    default: 0
  },
  duration: {
    type: Number,                     // in minutes
    default: 0
  },
  otp: {
    type: String                      // for ride start verification
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  rating: {
    userRating: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  },
  cancelReason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);