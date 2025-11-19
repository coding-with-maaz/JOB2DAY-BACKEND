const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WebsiteSetting = sequelize.define('WebsiteSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  siteTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  siteDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  siteKeywords: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ogTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ogDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ogImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  favicon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['siteTitle'] }
  ],
  // Ensure only one row exists for settings
  hooks: {
    beforeCreate: async (setting, options) => {
      const existingSetting = await WebsiteSetting.findOne({ attributes: ['id'] });
      if (existingSetting) {
        throw new Error('Website settings already exist. Use update instead.');
      }
    },
  }
});

module.exports = WebsiteSetting; 