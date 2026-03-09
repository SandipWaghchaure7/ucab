const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true
  },
  vehicle: {
    type: {
      type: String,
      enum: ['Mini', 'Sedan', 'SUV', 'Auto'],
      required: true
    },
    model: { type: String, required: true },   // e.g. "Maruti Swift"
    plateNumber: { type: String, required: true },
    color: { type: String }
  },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  totalRides: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);