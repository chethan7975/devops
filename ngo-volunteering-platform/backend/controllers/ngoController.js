const User = require('../models/User');
const NGO = require('../models/NGO');
const Certificate = require('../models/Certificate');

// @desc    Get NGO dashboard data
// @route   GET /api/ngo/dashboard
// @access  Private (NGO only)
const getNGODashboard = async (req, res) => {
  try {
    const ngoId = req.user._id;

    const ngo = await NGO.findById(ngoId)
      .populate({
        path: 'volunteers',
        select: 'name email serviceDays isApproved lastServiceDate',
        options: { sort: { serviceDays: -1 } }
      })
      .populate('certificates');

    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    // Calculate statistics
    const totalVolunteers = ngo.volunteers.length;
    const approvedVolunteers = ngo.volunteers.filter(v => v.isApproved).length;
    const pendingApprovals = totalVolunteers - approvedVolunteers;
    const totalServiceDays = ngo.volunteers.reduce((sum, v) => sum + v.serviceDays, 0);
    const certificatesIssued = ngo.certificates.length;

    // Get volunteers eligible for certificates
    const eligibleForCertificate = ngo.volunteers.filter(
      v => v.serviceDays >= ngo.certificateThreshold && v.isApproved
    );

    // Get top volunteers (leaderboard)
    const topVolunteers = ngo.volunteers
      .filter(v => v.isApproved)
      .sort((a, b) => b.serviceDays - a.serviceDays)
      .slice(0, 10);

    // Recent activity (volunteers who served in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = ngo.volunteers.filter(
      v => v.lastServiceDate && v.lastServiceDate >= sevenDaysAgo
    ).sort((a, b) => b.lastServiceDate - a.lastServiceDate);

    res.json({
      success: true,
      data: {
        ngo: {
          name: ngo.name,
          description: ngo.description,
          certificateThreshold: ngo.certificateThreshold,
          logo: ngo.logo,
        },
        stats: {
          totalVolunteers,
          approvedVolunteers,
          pendingApprovals,
          totalServiceDays,
          certificatesIssued,
          eligibleForCertificate: eligibleForCertificate.length,
        },
        volunteers: ngo.volunteers,
        topVolunteers,
        recentActivity,
        eligibleForCertificate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching NGO dashboard' });
  }
};

// @desc    Approve/Reject volunteer
// @route   PUT /api/ngo/volunteers/:volunteerId/approve
// @access  Private (NGO only)
const approveVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { approved } = req.body;
    const ngoId = req.user._id;

    const volunteer = await User.findById(volunteerId);
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    if (volunteer.ngoId.toString() !== ngoId.toString()) {
      return res.status(403).json({ message: 'Not authorized to approve this volunteer' });
    }

    volunteer.isApproved = approved;
    await volunteer.save();

    res.json({
      success: true,
      message: `Volunteer ${approved ? 'approved' : 'rejected'} successfully`,
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        isApproved: volunteer.isApproved,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error approving volunteer' });
  }
};

// @desc    Update certificate threshold
// @route   PUT /api/ngo/certificate-threshold
// @access  Private (NGO only)
const updateCertificateThreshold = async (req, res) => {
  try {
    const { threshold } = req.body;
    const ngoId = req.user._id;

    if (!threshold || threshold < 1) {
      return res.status(400).json({ message: 'Invalid threshold value' });
    }

    const ngo = await NGO.findById(ngoId);
    
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    ngo.certificateThreshold = threshold;
    await ngo.save();

    res.json({
      success: true,
      message: 'Certificate threshold updated successfully',
      certificateThreshold: ngo.certificateThreshold,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating certificate threshold' });
  }
};

// @desc    Get volunteer details
// @route   GET /api/ngo/volunteers/:volunteerId
// @access  Private (NGO only)
const getVolunteerDetails = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const ngoId = req.user._id;

    const volunteer = await User.findById(volunteerId)
      .populate('certificates')
      .populate('ngoId', 'name');

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    if (volunteer.ngoId._id.toString() !== ngoId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this volunteer' });
    }

    // Get recent service history (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const recentServices = volunteer.serviceHistory.filter(
      service => service.date >= ninetyDaysAgo
    ).sort((a, b) => b.date - a.date);

    res.json({
      success: true,
      data: {
        volunteer: {
          id: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          serviceDays: volunteer.serviceDays,
          isApproved: volunteer.isApproved,
          lastServiceDate: volunteer.lastServiceDate,
          joinDate: volunteer.createdAt,
        },
        certificates: volunteer.certificates,
        recentServices,
        stats: {
          totalServices: volunteer.serviceDays,
          last90Days: recentServices.length,
          averagePerMonth: Math.round(recentServices.length / 3),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching volunteer details' });
  }
};

// @desc    Get volunteers list with filtering and sorting
// @route   GET /api/ngo/volunteers
// @access  Private (NGO only)
const getVolunteers = async (req, res) => {
  try {
    const ngoId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      approved, 
      sortBy = 'serviceDays', 
      sortOrder = 'desc',
      search 
    } = req.query;

    // Build query
    let query = { ngoId };
    
    if (approved !== undefined) {
      query.isApproved = approved === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const totalVolunteers = await User.countDocuments(query);
    const volunteers = await User.find(query)
      .select('name email serviceDays isApproved lastServiceDate createdAt')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      data: {
        volunteers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalVolunteers / limit),
          totalVolunteers,
          hasNext: page * limit < totalVolunteers,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching volunteers' });
  }
};

module.exports = {
  getNGODashboard,
  approveVolunteer,
  updateCertificateThreshold,
  getVolunteerDetails,
  getVolunteers,
};