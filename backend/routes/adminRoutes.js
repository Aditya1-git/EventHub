const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAdminEvents,
  getAdminRegistrations,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getAdminAnalytics
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/events', getAdminEvents);
router.get('/registrations', getAdminRegistrations);
router.get('/users', getAdminUsers);
router.get('/analytics', getAdminAnalytics);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
