const bcrypt = require('bcrypt');
const { User } = require('../src/models');

async function seedAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@harpaljob.com',
      password: hashedPassword,
      role: 'admin',
      phoneNumber: '1234567890',
      isActive: true
    });
    console.log('Admin user seeded successfully');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

module.exports = seedAdmin; 