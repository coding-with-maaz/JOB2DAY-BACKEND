const { User } = require('../models');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Logic to get all users
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'phoneNumber', 'isActive', 'logoUrl', 'companySince', 'companyName']
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    // Logic to get user by ID
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'phoneNumber', 'isActive', 'logoUrl', 'companySince', 'companyName']
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    // Logic to update user
    const userId = req.params.id;
    const { firstName, lastName, email, role, phoneNumber, isActive, logoUrl, companySince, companyName } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    user.logoUrl = logoUrl || user.logoUrl;
    user.companySince = companySince !== undefined ? companySince : user.companySince;
    user.companyName = companyName || user.companyName;

    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    // Logic to delete user
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
}; 