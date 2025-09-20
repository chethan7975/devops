const express = require('express');
const {
  registerVolunteer,
  registerNGO,
  login,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register/volunteer
router.post('/register/volunteer', registerVolunteer);

// @route   POST /api/auth/register/ngo
router.post('/register/ngo', registerNGO);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;