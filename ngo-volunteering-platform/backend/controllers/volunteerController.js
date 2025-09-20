const User = require('../models/User');
const NGO = require('../models/NGO');

// @desc    Mark daily service (check-in)
// @route   POST /api/volunteer/checkin
// @access  Private (Volunteer only)
const markDailyService = async (req, res) => {
  try {
    const volunteerId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const volunteer = await User.findById(volunteerId);
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    if (!volunteer.isApproved) {
      return res.status(403).json({ message: 'Your account is not yet approved by the NGO' });
    }

    // Check if already checked in today
    const lastServiceDate = volunteer.lastServiceDate;
    if (lastServiceDate && lastServiceDate >= today) {
      return res.status(400).json({ message: 'You have already checked in today' });
    }

    // Add service entry to history
    volunteer.serviceHistory.push({
      date: new Date(),
      approved: true, // Auto-approve for now, can be changed to require NGO approval
    });

    // Update service days and last service date
    volunteer.serviceDays += 1;
    volunteer.lastServiceDate = new Date();

    await volunteer.save();

    res.json({
      success: true,
      message: 'Daily service marked successfully',
      serviceDays: volunteer.serviceDays,
      lastServiceDate: volunteer.lastServiceDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error marking daily service' });
  }
};

// @desc    Get volunteer dashboard data
// @route   GET /api/volunteer/dashboard
// @access  Private (Volunteer only)
const getVolunteerDashboard = async (req, res) => {
  try {
    const volunteerId = req.user._id;

    const volunteer = await User.findById(volunteerId)
      .populate('ngoId', 'name logo certificateThreshold')
      .populate('certificates');

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    const ngo = volunteer.ngoId;
    const canGetCertificate = volunteer.serviceDays >= ngo.certificateThreshold;
    
    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hasCheckedInToday = volunteer.lastServiceDate && volunteer.lastServiceDate >= today;

    // Get recent service history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentServices = volunteer.serviceHistory.filter(
      service => service.date >= thirtyDaysAgo
    ).sort((a, b) => b.date - a.date);

    res.json({
      success: true,
      data: {
        volunteer: {
          name: volunteer.name,
          email: volunteer.email,
          serviceDays: volunteer.serviceDays,
          isApproved: volunteer.isApproved,
          lastServiceDate: volunteer.lastServiceDate,
          hasCheckedInToday,
        },
        ngo: {
          name: ngo.name,
          logo: ngo.logo,
          certificateThreshold: ngo.certificateThreshold,
        },
        certificates: volunteer.certificates,
        canGetCertificate,
        recentServices,
        stats: {
          totalServices: volunteer.serviceDays,
          thisMonth: recentServices.length,
          daysUntilCertificate: Math.max(0, ngo.certificateThreshold - volunteer.serviceDays),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
};

// @desc    Get volunteer service history
// @route   GET /api/volunteer/history
// @access  Private (Volunteer only)
const getServiceHistory = async (req, res) => {
  try {
    const volunteerId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const volunteer = await User.findById(volunteerId);
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    const totalServices = volunteer.serviceHistory.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);

    const services = volunteer.serviceHistory
      .sort((a, b) => b.date - a.date)
      .slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalServices / limit),
          totalServices,
          hasNext: endIndex < totalServices,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching service history' });
  }
};

// @desc    Get all NGOs for volunteer registration
// @route   GET /api/volunteer/ngos
// @access  Public
const getAllNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find({}, 'name description logo certificateThreshold contactInfo')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: ngos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching NGOs' });
  }
};

module.exports = {
  markDailyService,
  getVolunteerDashboard,
  getServiceHistory,
  getAllNGOs,
};