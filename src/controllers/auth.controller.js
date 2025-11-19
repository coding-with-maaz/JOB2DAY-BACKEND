const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Register user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phoneNumber, logoUrl, companySince, companyName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phoneNumber,
      logoUrl,
      companySince,
      companyName
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        logoUrl: user.logoUrl,
        companySince: user.companySince,
        companyName: user.companyName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    console.log('Request body:', req.body);

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    console.log('Password validation result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for user:', email);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        logoUrl: user.logoUrl,
        companySince: user.companySince,
        companyName: user.companyName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
}; 