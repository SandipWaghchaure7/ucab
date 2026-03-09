const User    = require('../models/User');
const Driver  = require('../models/Driver');
const Ride    = require('../models/Ride');
const Payment = require('../models/Payment');

// ─── DASHBOARD STATS ──────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDrivers,
      totalRides,
      completedRides,
      cancelledRides,
      activeRides,
      totalPayments,
      verifiedDrivers,
      unverifiedDrivers
    ] = await Promise.all([
      User.countDocuments(),
      Driver.countDocuments(),
      Ride.countDocuments(),
      Ride.countDocuments({ status: 'completed' }),
      Ride.countDocuments({ status: 'cancelled' }),
      Ride.countDocuments({ status: { $in: ['accepted','arriving','ongoing'] } }),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Driver.countDocuments({ isVerified: true }),
      Driver.countDocuments({ isVerified: false })
    ]);

    // Revenue last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueChart = await Ride.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          rides:   { $sum: 1 },
          revenue: { $sum: '$fare.final' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDrivers,
        totalRides,
        completedRides,
        cancelledRides,
        activeRides,
        totalRevenue:     totalPayments[0]?.total || 0,
        verifiedDrivers,
        unverifiedDrivers,
        completionRate:   totalRides
          ? Math.round((completedRides / totalRides) * 100)
          : 0
      },
      revenueChart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL USERS ────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = search
      ? { $or: [
          { name:  { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]}
      : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL DRIVERS ──────────────────────────────────
const getAllDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', verified } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (verified !== undefined) query.isVerified = verified === 'true';

    const drivers = await Driver.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Driver.countDocuments(query);

    res.status(200).json({
      success: true,
      drivers,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── VERIFY DRIVER ────────────────────────────────────
const verifyDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      { new: true }
    ).select('-password');

    if (!driver)
      return res.status(404).json({ success: false, message: 'Driver not found' });

    res.status(200).json({
      success: true,
      message: driver.isVerified ? '✅ Driver verified' : '❌ Driver unverified',
      driver
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL RIDES ────────────────────────────────────
const getAllRides = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const query = status ? { status } : {};

    const rides = await Ride.find(query)
      .populate('user',   'name email phone')
      .populate('driver', 'name phone vehicle')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Ride.countDocuments(query);

    res.status(200).json({
      success: true,
      rides,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE USER ──────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOGGLE USER STATUS ───────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllDrivers,
  verifyDriver,
  getAllRides,
  deleteUser,
  toggleUserStatus
};