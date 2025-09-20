const User = require('../models/User');
const NGO = require('../models/NGO');
const generateToken = require('../utils/generateToken');

// @desc    Register a new volunteer
// @route   POST /api/auth/register/volunteer
// @access  Public
const registerVolunteer = async (req, res) => {
  try {
    const { name, email, password, ngoId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if NGO exists
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(400).json({ message: 'Invalid NGO selected' });
    }

    // Create volunteer
    const volunteer = await User.create({
      name,
      email,
      password,
      role: 'volunteer',
      ngoId,
    });

    // Add volunteer to NGO's volunteer list
    ngo.volunteers.push(volunteer._id);
    await ngo.save();

    // Generate token
    const token = generateToken(volunteer._id, 'volunteer');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: volunteer.role,
        ngoId: volunteer.ngoId,
        serviceDays: volunteer.serviceDays,
        isApproved: volunteer.isApproved,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during volunteer registration' });
  }
};

// @desc    Register a new NGO
// @route   POST /api/auth/register/ngo
// @access  Public
const registerNGO = async (req, res) => {
  try {
    const { name, email, password, description, certificateThreshold, contactInfo } = req.body;

    // Check if NGO already exists
    const existingNGO = await NGO.findOne({ email });
    if (existingNGO) {
      return res.status(400).json({ message: 'NGO already exists with this email' });
    }

    // Create NGO
    const ngo = await NGO.create({
      name,
      email,
      password,
      description,
      certificateThreshold: certificateThreshold || 30,
      contactInfo,
    });

    // Generate token
    const token = generateToken(ngo._id, 'ngo');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        role: 'ngo',
        certificateThreshold: ngo.certificateThreshold,
        volunteers: ngo.volunteers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during NGO registration' });
  }
};

// @desc    Login user (volunteer or NGO)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user;
    let userRole;

    // Find user based on role
    if (role === 'volunteer') {
      user = await User.findOne({ email, role: 'volunteer' }).populate('ngoId', 'name');
      userRole = 'volunteer';
    } else if (role === 'ngo') {
      user = await NGO.findOne({ email });
      userRole = 'ngo';
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if user exists and password matches
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, userRole);

    // Prepare user data based on role
    let userData;
    if (userRole === 'volunteer') {
      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ngoId: user.ngoId,
        serviceDays: user.serviceDays,
        isApproved: user.isApproved,
        certificates: user.certificates,
      };
    } else {
      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'ngo',
        certificateThreshold: user.certificateThreshold,
        volunteers: user.volunteers,
      };
    }

    res.json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;
    
    let userData;
    if (user.role === 'volunteer') {
      const volunteer = await User.findById(user._id)
        .populate('ngoId', 'name logo')
        .populate('certificates')
        .select('-password');
      
      userData = {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: volunteer.role,
        ngoId: volunteer.ngoId,
        serviceDays: volunteer.serviceDays,
        isApproved: volunteer.isApproved,
        certificates: volunteer.certificates,
        serviceHistory: volunteer.serviceHistory,
      };
    } else {
      const ngo = await NGO.findById(user._id)
        .populate('volunteers', 'name email serviceDays isApproved')
        .select('-password');
      
      userData = {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        role: 'ngo',
        description: ngo.description,
        certificateThreshold: ngo.certificateThreshold,
        volunteers: ngo.volunteers,
        logo: ngo.logo,
        contactInfo: ngo.contactInfo,
      };
    }

    res.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

module.exports = {
  registerVolunteer,
  registerNGO,
  login,
  getMe,
};