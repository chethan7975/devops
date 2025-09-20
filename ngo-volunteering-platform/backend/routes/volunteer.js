const express = require('express');
const {
  markDailyService,
  getVolunteerDashboard,
  getServiceHistory,
  getAllNGOs,
} = require('../controllers/volunteerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/volunteer/ngos
router.get('/ngos', getAllNGOs);

// @route   POST /api/volunteer/checkin
router.post('/checkin', protect, authorize('volunteer'), markDailyService);

// @route   GET /api/volunteer/dashboard
router.get('/dashboard', protect, authorize('volunteer'), getVolunteerDashboard);

// @route   GET /api/volunteer/history
router.get('/history', protect, authorize('volunteer'), getServiceHistory);

module.exports = router;