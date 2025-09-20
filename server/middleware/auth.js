const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NGO = require('../models/NGO');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is approved
    let user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      user = await NGO.findById(decoded.userId).select('-password');
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Check if volunteer is approved
    if (user.role === 'volunteer' && !user.isApproved) {
      return res.status(403).json({ message: 'Account pending approval' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check if user is NGO admin
const ngoAuth = (req, res, next) => {
  if (req.user.role !== 'ngo') {
    return res.status(403).json({ message: 'Access denied. NGO admin required.' });
  }
  next();
};

// Check if user is volunteer
const volunteerAuth = (req, res, next) => {
  if (req.user.role !== 'volunteer') {
    return res.status(403).json({ message: 'Access denied. Volunteer access required.' });
  }
  next();
};

// Check if user is approved volunteer
const approvedVolunteerAuth = (req, res, next) => {
  if (req.user.role !== 'volunteer' || !req.user.isApproved) {
    return res.status(403).json({ message: 'Access denied. Approved volunteer access required.' });
  }
  next();
};

module.exports = {
  auth,
  ngoAuth,
  volunteerAuth,
  approvedVolunteerAuth
};