const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const NGO = require('../models/NGO');
const { auth, approvedVolunteerAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/attendance/mark
// @desc    Mark daily attendance for volunteer
// @access  Private (Volunteer)
router.post('/mark', [
  auth,
  approvedVolunteerAuth,
  body('date').optional().isISO8601().withMessage('Please provide a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date } = req.body;
    const attendanceDate = date ? new Date(date) : new Date();
    
    // Check if already marked attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastServiceDate = req.user.lastServiceDate ? new Date(req.user.lastServiceDate) : null;
    if (lastServiceDate) {
      lastServiceDate.setHours(0, 0, 0, 0);
    }

    if (lastServiceDate && lastServiceDate.getTime() === today.getTime()) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    // Update volunteer's service days and last service date
    const volunteer = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: { serviceDays: 1 },
        lastServiceDate: attendanceDate
      },
      { new: true }
    ).populate('ngoId', 'name certificateThreshold');

    // Update NGO's total service days
    await NGO.findByIdAndUpdate(
      volunteer.ngoId._id,
      { $inc: { totalServiceDays: 1 } }
    );

    // Check if volunteer is eligible for certificate
    const isEligibleForCertificate = volunteer.serviceDays >= volunteer.ngoId.certificateThreshold;
    const daysUntilCertificate = volunteer.ngoId.certificateThreshold - volunteer.serviceDays;

    res.json({
      message: 'Attendance marked successfully',
      volunteer: {
        serviceDays: volunteer.serviceDays,
        lastServiceDate: volunteer.lastServiceDate,
        isEligibleForCertificate,
        daysUntilCertificate: isEligibleForCertificate ? 0 : daysUntilCertificate
      }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error while marking attendance' });
  }
});

// @route   GET /api/attendance/stats
// @desc    Get volunteer attendance statistics
// @access  Private (Volunteer)
router.get('/stats', [auth, approvedVolunteerAuth], async (req, res) => {
  try {
    const volunteer = await User.findById(req.user._id)
      .populate('ngoId', 'name certificateThreshold')
      .populate('certificates', 'issueDate serviceDays certificateURL');

    const stats = {
      serviceDays: volunteer.serviceDays,
      lastServiceDate: volunteer.lastServiceDate,
      ngoName: volunteer.ngoId.name,
      certificateThreshold: volunteer.ngoId.certificateThreshold,
      isEligibleForCertificate: volunteer.serviceDays >= volunteer.ngoId.certificateThreshold,
      daysUntilCertificate: Math.max(0, volunteer.ngoId.certificateThreshold - volunteer.serviceDays),
      certificates: volunteer.certificates,
      totalCertificates: volunteer.certificates.length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
});

// @route   GET /api/attendance/history
// @desc    Get volunteer attendance history
// @access  Private (Volunteer)
router.get('/history', [auth, approvedVolunteerAuth], async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (page - 1) * limit;

    // This is a simplified version - in a real app, you'd have a separate Attendance model
    const volunteer = await User.findById(req.user._id)
      .select('serviceDays lastServiceDate createdAt')
      .populate('ngoId', 'name');

    // Generate mock attendance history based on service days
    const attendanceHistory = [];
    const currentDate = new Date();
    
    for (let i = 0; i < volunteer.serviceDays; i++) {
      const serviceDate = new Date(currentDate);
      serviceDate.setDate(serviceDate.getDate() - i);
      attendanceHistory.push({
        date: serviceDate,
        dayNumber: volunteer.serviceDays - i
      });
    }

    const paginatedHistory = attendanceHistory.slice(skip, skip + parseInt(limit));

    res.json({
      history: paginatedHistory,
      totalDays: volunteer.serviceDays,
      currentPage: parseInt(page),
      totalPages: Math.ceil(volunteer.serviceDays / limit)
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error while fetching history' });
  }
});

// @route   GET /api/attendance/volunteers/:ngoId
// @desc    Get all volunteers attendance for NGO
// @access  Private (NGO)
router.get('/volunteers/:ngoId', [auth], async (req, res) => {
  try {
    const { ngoId } = req.params;
    const { page = 1, limit = 20, sortBy = 'serviceDays', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is NGO admin
    if (req.user.role !== 'ngo' || req.user._id.toString() !== ngoId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const volunteers = await User.find({ ngoId, role: 'volunteer' })
      .select('name email serviceDays lastServiceDate createdAt isApproved')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalVolunteers = await User.countDocuments({ ngoId, role: 'volunteer' });

    res.json({
      volunteers,
      totalVolunteers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalVolunteers / limit)
    });
  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({ message: 'Server error while fetching volunteers' });
  }
});

module.exports = router;