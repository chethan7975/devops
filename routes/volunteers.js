const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const NGO = require('../models/NGO');
const { auth, ngoAuth } = require('../middleware/auth');
const { sendVolunteerApprovedEmail } = require('../utils/emailService');

const router = express.Router();

// @route   GET /api/volunteers/pending
// @desc    Get pending volunteer approvals for NGO
// @access  Private (NGO)
router.get('/pending', [auth, ngoAuth], async (req, res) => {
  try {
    const volunteers = await User.find({
      ngoId: req.user._id,
      role: 'volunteer',
      isApproved: false
    }).select('name email phone address createdAt');

    res.json(volunteers);
  } catch (error) {
    console.error('Get pending volunteers error:', error);
    res.status(500).json({ message: 'Server error while fetching pending volunteers' });
  }
});

// @route   PUT /api/volunteers/:volunteerId/approve
// @desc    Approve a volunteer
// @access  Private (NGO)
router.put('/:volunteerId/approve', [auth, ngoAuth], async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const volunteer = await User.findOneAndUpdate(
      { _id: volunteerId, ngoId: req.user._id, role: 'volunteer' },
      { isApproved: true },
      { new: true }
    ).select('name email serviceDays isApproved');

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    // Send approval email notification
    try {
      await sendVolunteerApprovedEmail(
        volunteer.email,
        volunteer.name,
        req.user.name
      );
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: 'Volunteer approved successfully',
      volunteer
    });
  } catch (error) {
    console.error('Approve volunteer error:', error);
    res.status(500).json({ message: 'Server error while approving volunteer' });
  }
});

// @route   PUT /api/volunteers/:volunteerId/reject
// @desc    Reject a volunteer
// @access  Private (NGO)
router.put('/:volunteerId/reject', [auth, ngoAuth], async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const volunteer = await User.findOneAndDelete({
      _id: volunteerId,
      ngoId: req.user._id,
      role: 'volunteer',
      isApproved: false
    });

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    // Remove volunteer from NGO's volunteer list
    await NGO.findByIdAndUpdate(
      req.user._id,
      { $pull: { volunteers: volunteerId } }
    );

    res.json({ message: 'Volunteer rejected and removed' });
  } catch (error) {
    console.error('Reject volunteer error:', error);
    res.status(500).json({ message: 'Server error while rejecting volunteer' });
  }
});

// @route   GET /api/volunteers/leaderboard/:ngoId
// @desc    Get volunteer leaderboard for NGO
// @access  Private (NGO)
router.get('/leaderboard/:ngoId', [auth], async (req, res) => {
  try {
    const { ngoId } = req.params;
    const { limit = 10 } = req.query;

    // Check if user is NGO admin
    if (req.user.role !== 'ngo' || req.user._id.toString() !== ngoId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const volunteers = await User.find({
      ngoId,
      role: 'volunteer',
      isApproved: true
    })
    .select('name serviceDays lastServiceDate')
    .sort({ serviceDays: -1 })
    .limit(parseInt(limit));

    const leaderboard = volunteers.map((volunteer, index) => ({
      rank: index + 1,
      name: volunteer.name,
      serviceDays: volunteer.serviceDays,
      lastServiceDate: volunteer.lastServiceDate
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error while fetching leaderboard' });
  }
});

// @route   GET /api/volunteers/stats/:ngoId
// @desc    Get volunteer statistics for NGO
// @access  Private (NGO)
router.get('/stats/:ngoId', [auth], async (req, res) => {
  try {
    const { ngoId } = req.params;

    // Check if user is NGO admin
    if (req.user.role !== 'ngo' || req.user._id.toString() !== ngoId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await User.aggregate([
      {
        $match: {
          ngoId: new mongoose.Types.ObjectId(ngoId),
          role: 'volunteer'
        }
      },
      {
        $group: {
          _id: null,
          totalVolunteers: { $sum: 1 },
          approvedVolunteers: {
            $sum: { $cond: ['$isApproved', 1, 0] }
          },
          pendingVolunteers: {
            $sum: { $cond: ['$isApproved', 0, 1] }
          },
          totalServiceDays: { $sum: '$serviceDays' },
          averageServiceDays: { $avg: '$serviceDays' },
          maxServiceDays: { $max: '$serviceDays' }
        }
      }
    ]);

    const result = stats[0] || {
      totalVolunteers: 0,
      approvedVolunteers: 0,
      pendingVolunteers: 0,
      totalServiceDays: 0,
      averageServiceDays: 0,
      maxServiceDays: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get volunteer stats error:', error);
    res.status(500).json({ message: 'Server error while fetching volunteer stats' });
  }
});

module.exports = router;