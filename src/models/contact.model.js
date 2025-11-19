const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'read', 'replied'),
    defaultValue: 'pending'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    { fields: ['email'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

const ContactInfo = sequelize.define('ContactInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    { fields: ['type'] },
    { fields: ['isActive'] }
  ]
});

const FAQ = sequelize.define('FAQ', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    { fields: ['question'] },
    { fields: ['isActive'] }
  ]
});

module.exports = {
  Contact,
  ContactInfo,
  FAQ
}; 