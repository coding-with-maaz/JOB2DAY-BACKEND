const { sequelize, initDatabase } = require('../config/database');
const User = require('./user.model');
const Job = require('./job.model');
const Category = require('./category.model');
const Company = require('./company.model');
const WebsiteSetting = require('./websiteSetting.model');
const Ad = require('./ad.model');
const AdsConfig = require('./adsConfig.model');
const Analytics = require('./analytics.model');
const About = require('./about.model');
const ContactInfo = require('./contact.model').ContactInfo;
const FAQ = require('./contact.model').FAQ;
const JobApplication = require('./jobApplication.model');
const SEO = require('./seo.model');

// Define all models
const models = {
  User,
  Job,
  Category,
  Company,
  WebsiteSetting,
  Ad,
  AdsConfig,
  Analytics,
  About,
  ContactInfo,
  FAQ,
  JobApplication,
  SEO
};

// Initialize associations
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Initialize database and models
async function initializeModels() {
  try {
    // Initialize database first
    await initDatabase();

    // Sync all models with the database
    await sequelize.sync({ alter: true });

    return models;
  } catch (error) {
    console.error('Error initializing models:', error);
    throw error;
  }
}

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Job,
  Category,
  Company,
  WebsiteSetting,
  Ad,
  AdsConfig,
  Analytics,
  About,
  ContactInfo,
  FAQ,
  JobApplication,
  SEO,
  initializeModels
}; 