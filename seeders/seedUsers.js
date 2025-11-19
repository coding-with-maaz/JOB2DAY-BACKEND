const { User } = require('../src/models');
const bcrypt = require('bcryptjs');

async function seedUsers() {
  const users = await User.bulkCreate([
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',  // Let the hook handle the hashing
      role: 'admin',
      phoneNumber: '123-456-7890',
      isActive: true,
      logoUrl: null,
      companySince: null,
      companyName: null,
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',  // Let the hook handle the hashing
      role: 'user',
      phoneNumber: '098-765-4321',
      isActive: true,
      logoUrl: 'https://example.com/johndoe-logo.png',
      companySince: 2010,
      companyName: 'HarpalJob',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'password123',  // Let the hook handle the hashing
      role: 'user',
      phoneNumber: '555-123-4567',
      isActive: true,
      logoUrl: 'https://example.com/janesmith-logo.png',
      companySince: 2015,
      companyName: 'AnotherCompany',
    }
  ], { individualHooks: true }); // Keep hooks enabled for password hashing

  return users;
}

module.exports = seedUsers; 