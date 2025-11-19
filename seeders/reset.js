const { sequelize } = require('../src/models');
const seedAll = require('./seed');

async function resetDatabase() {
  try {
    console.log('🔄 Starting database reset...');

    // Disable foreign key checks
    console.log('🔓 Disabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Drop all tables
    console.log('🗑️ Dropping all tables...');
    await sequelize.sync({ force: true });

    // Re-enable foreign key checks
    console.log('🔒 Re-enabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('✅ Database reset complete!');
    
    // Run the seeder with force=true
    console.log('🌱 Starting data seeding...');
    await seedAll(true);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase(); 