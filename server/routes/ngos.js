const express = require('express');
const { body, validationResult } = require('express-validator');
const NGO = require('../models/NGO');
const User = require('../models/User');
const { auth, ngoAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/ngos
// @desc    Get all NGOs (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      isVerified: true,
      ...(search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      })
    };

    const ngos = await NGO.find(query)
      .select('name description logo website address totalVolunteers totalServiceDays')
      .sort({ totalVolunteers: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalNGOs = await NGO.countDocuments(query);

    res.json({
      ngos,
      totalNGOs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalNGOs / limit)
    });
  } catch (error) {
    console.error('Get NGOs error:', error);
    res.status(500).json({ message: 'Server error while fetching NGOs' });
  }
});

// @route   GET /api/ngos/:id
// @desc    Get single NGO details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id)
      .select('-password -verificationDocuments');

    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    res.json(ngo);
  } catch (error) {
    console.error('Get NGO error:', error);
    res.status(500).json({ message: 'Server error while fetching NGO' });
  }
});

// @route   PUT /api/ngos/profile
// @desc    Update NGO profile
// @access  Private (NGO)
router.put('/profile', [
  auth,
  ngoAuth,
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('website').optional().isURL(),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = ['name', 'description', 'website', 'phone', 'address'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const ngo = await NGO.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      ngo
    });
  } catch (error) {
    console.error('Update NGO profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @route   PUT /api/ngos/certificate-threshold
// @desc    Update certificate threshold
// @access  Private (NGO)
router.put('/certificate-threshold', [
  auth,
  ngoAuth,
  body('threshold').isInt({ min: 1 }).withMessage('Threshold must be at least 1 day')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { threshold } = req.body;

    const ngo = await NGO.findByIdAndUpdate(
      req.user._id,
      { certificateThreshold: threshold },
      { new: true }
    ).select('certificateThreshold');

    res.json({
      message: 'Certificate threshold updated successfully',
      certificateThreshold: ngo.certificateThreshold
    });
  } catch (error) {
    console.error('Update threshold error:', error);
    res.status(500).json({ message: 'Server error while updating threshold' });
  }
});

// @route   GET /api/ngos/dashboard/:ngoId
// @desc    Get NGO dashboard data
// @access  Private (NGO)
router.get('/dashboard/:ngoId', [auth], async (req, res) => {
  try {
    const { ngoId } = req.params;

    // Check if user is NGO admin
    if (req.user.role !== 'ngo' || req.user._id.toString() !== ngoId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const ngo = await NGO.findById(ngoId)
      .select('name totalVolunteers totalServiceDays certificateThreshold');

    const recentVolunteers = await User.find({
      ngoId,
      role: 'volunteer',
      isApproved: true
    })
    .select('name email serviceDays lastServiceDate createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

    const topVolunteers = await User.find({
      ngoId,
      role: 'volunteer',
      isApproved: true
    })
    .select('name serviceDays')
    .sort({ serviceDays: -1 })
    .limit(5);

    const dashboard = {
      ngo: ngo,
      recentVolunteers,
      topVolunteers,
      stats: {
        totalVolunteers: ngo.totalVolunteers,
        totalServiceDays: ngo.totalServiceDays,
        certificateThreshold: ngo.certificateThreshold
      }
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard' });
  }
});

module.exports = router;