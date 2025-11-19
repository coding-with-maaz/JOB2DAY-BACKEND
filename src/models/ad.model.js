const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Ad = sequelize.define('Ad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adCode: {
    type: DataTypes.TEXT, // Store the ad code (HTML/JS) or configuration
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING, // e.g., 'homepage', 'job_sidebar'
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  adNetwork: {
    type: DataTypes.STRING,
    allowNull: true, // e.g., 'Terra Ads', 'Google AdSense'
  },
  dimensions: {
    type: DataTypes.STRING, // e.g., '300x250', '728x90'
    allowNull: true,
  },
  adType: {
    type: DataTypes.STRING, // e.g., 'display', 'native'
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['location'] },
    { fields: ['isActive'] },
    { fields: ['adNetwork'] },
    { fields: ['adType'] }
  ]
});

module.exports = Ad; 