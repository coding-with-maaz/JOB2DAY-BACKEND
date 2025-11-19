const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const About = sequelize.define('About', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  stats: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('stats');
      return rawValue ? JSON.parse(JSON.stringify(rawValue)) : [];
    }
  },
  story: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mission: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  values: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('values');
      return rawValue ? JSON.parse(JSON.stringify(rawValue)) : [];
    }
  },
  team: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('team');
      return rawValue ? JSON.parse(JSON.stringify(rawValue)) : [];
    }
  },
  seoTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seoDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  seoKeywords: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['title'] },
    { fields: ['status'] }
  ]
});

module.exports = About; 