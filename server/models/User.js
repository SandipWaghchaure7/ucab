const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'driver', 'admin'],
    default: 'user'
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  savedAddresses: [
    {
      label: String,      // e.g. "Home", "Office"
      address: String
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);