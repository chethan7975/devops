const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NGO = require('../models/NGO');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      if (decoded.role === 'volunteer') {
        req.user = await User.findById(decoded.id).select('-password');
      } else if (decoded.role === 'ngo') {
        req.user = await NGO.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if user role is in the allowed roles
    const userRole = req.user.role || (req.user.volunteers ? 'ngo' : 'volunteer');
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Role ${userRole} is not authorized to access this resource` 
      });
    }

    next();
  };
};

module.exports = { protect, authorize };