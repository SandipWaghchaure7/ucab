const express    = require('express');
const router     = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllDrivers,
  verifyDriver,
  getAllRides,
  deleteUser,
  toggleUserStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats',                getDashboardStats);
router.get('/users',                getAllUsers);
router.get('/drivers',              getAllDrivers);
router.get('/rides',                getAllRides);
router.put('/drivers/:id/verify',   verifyDriver);
router.delete('/users/:id',         deleteUser);
router.put('/users/:id/toggle',     toggleUserStatus);

module.exports = router;