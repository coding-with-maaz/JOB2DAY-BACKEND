const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eventName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referrer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    { fields: ['eventType'] },
    { fields: ['eventName'] },
    { fields: ['userId'] },
    { fields: ['timestamp'] },
    { fields: ['pageUrl'] }
  ]
});

module.exports = Analytics; 