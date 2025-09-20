const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const NGO = require('../models/NGO');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register/volunteer
// @desc    Register a new volunteer
// @access  Public
router.post('/register/volunteer', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('ngoId').isMongoId().withMessage('Please provide a valid NGO ID'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, ngoId, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if NGO exists
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(400).json({ message: 'NGO not found' });
    }

    // Create new volunteer
    const volunteer = new User({
      name,
      email,
      password,
      role: 'volunteer',
      ngoId,
      phone,
      address,
      isApproved: false
    });

    await volunteer.save();

    // Add volunteer to NGO's volunteer list
    ngo.volunteers.push(volunteer._id);
    await ngo.save();

    const token = generateToken(volunteer._id);

    res.status(201).json({
      message: 'Volunteer registered successfully. Pending approval.',
      token,
      user: volunteer
    });
  } catch (error) {
    console.error('Volunteer registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/register/ngo
// @desc    Register a new NGO
// @access  Public
router.post('/register/ngo', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('NGO name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('website').optional().isURL().withMessage('Please provide a valid website URL'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, description, website, phone, address } = req.body;

    // Check if NGO already exists
    const existingNGO = await NGO.findOne({ email });
    if (existingNGO) {
      return res.status(400).json({ message: 'NGO already exists with this email' });
    }

    // Create new NGO
    const ngo = new NGO({
      name,
      email,
      password,
      description,
      website,
      phone,
      address,
      isVerified: false
    });

    await ngo.save();

    const token = generateToken(ngo._id);

    res.status(201).json({
      message: 'NGO registered successfully',
      token,
      ngo
    });
  } catch (error) {
    console.error('NGO registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user (volunteer or NGO)
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Try to find user in both User and NGO collections
    let user = await User.findOne({ email });
    let isNGO = false;

    if (!user) {
      user = await NGO.findOne({ email });
      isNGO = true;
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if volunteer is approved
    if (user.role === 'volunteer' && !user.isApproved) {
      return res.status(403).json({ message: 'Account pending approval' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user,
      isNGO
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
});

module.exports = router;