const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      // Enable index creation but with constraints
      indexes: true,
      // Add MySQL-specific options
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      // Optimize for InnoDB
      engine: 'InnoDB'
    }
  }
);

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Just sync models without altering existing tables
    await sequelize.sync({ alter: false });
    console.log('Models synchronized successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  initDatabase
}; 