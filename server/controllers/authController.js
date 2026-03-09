const User = require('../models/User');
const Driver = require('../models/Driver');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── Generate JWT Token ───────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── USER REGISTER ────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'user'
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
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

// ─── USER LOGIN ───────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
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

// ─── DRIVER REGISTER ──────────────────────────────────
const registerDriver = async (req, res) => {
  try {
    const { 
      name, email, password, phone, 
      licenseNumber, vehicleType, 
      vehicleModel, plateNumber, color 
    } = req.body;

    // Validation
    if (!name || !email || !password || !phone || 
        !licenseNumber || !vehicleType || 
        !vehicleModel || !plateNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check existing driver
    const existingDriver = await Driver.findOne({ 
      $or: [{ email }, { licenseNumber }] 
    });
    if (existingDriver) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or License already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create driver
    const driver = await Driver.create({
      name,
      email,
      password: hashedPassword,
      phone,
      licenseNumber,
      vehicle: {
        type: vehicleType,
        model: vehicleModel,
        plateNumber,
        color
      },
      role: 'driver'
    });

    const token = generateToken(driver._id, 'driver');

    res.status(201).json({
      success: true,
      message: 'Driver registered successfully. Await verification.',
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicle: driver.vehicle,
        isVerified: driver.isVerified
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

// ─── DRIVER LOGIN ─────────────────────────────────────
const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const token = generateToken(driver._id, 'driver');

    res.status(200).json({
      success: true,
      message: 'Driver login successful',
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        vehicle: driver.vehicle,
        isVerified: driver.isVerified,
        isAvailable: driver.isAvailable
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

// ─── GET PROFILE ──────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;

    let profile;
    if (role === 'driver') {
      profile = await Driver.findById(id).select('-password');
    } else {
      profile = await User.findById(id).select('-password');
    }

    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }

    res.status(200).json({ success: true, profile });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  registerDriver, 
  loginDriver, 
  getProfile 
};