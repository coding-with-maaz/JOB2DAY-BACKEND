const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is admin
exports.isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Error checking admin status' });
  }
};

// Middleware to check if user is employer
exports.isEmployer = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Employer access required' });
    }

    next();
  } catch (error) {
    console.error('Employer check error:', error);
    res.status(500).json({ message: 'Error checking employer status' });
  }
};

// Middleware to check if user is job seeker
exports.isJobSeeker = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Job seeker access required' });
    }

    next();
  } catch (error) {
    console.error('Job seeker check error:', error);
    res.status(500).json({ message: 'Error checking job seeker status' });
  }
}; 