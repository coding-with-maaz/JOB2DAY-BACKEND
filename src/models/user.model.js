const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
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
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companySince: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fcmToken: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Firebase Cloud Messaging token for push notifications'
  }
}, {
  tableName: 'Users',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['email'] },
    { fields: ['role'] },
    { fields: ['isActive'] },
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      // Check for existing user with same email
      const existingUser = await User.findOne({ where: { email: user.email } });
      if (existingUser) {
        throw new Error('Email already exists');
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      // Check for existing user with same email if email is being updated
      if (user.changed('email')) {
        const existingUser = await User.findOne({ 
          where: { 
            email: user.email,
            id: { [sequelize.Op.ne]: user.id } // Exclude current user
          } 
        });
        if (existingUser) {
          throw new Error('Email already exists');
        }
      }
    }
  }
});

// Instance method to check password
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Define associations
User.associate = (models) => {
  // Define the association with Job model
  User.hasMany(models.Job, { 
    foreignKey: 'employerId', 
    as: 'postedJobs',
    sourceKey: 'id'
  });

  // Define the association with JobApplication model
  User.hasMany(models.JobApplication, { 
    foreignKey: 'userId', 
    as: 'userApplications',
    sourceKey: 'id'
  });

  // Define the association with Company model
  User.hasOne(models.Company, {
    foreignKey: 'userId',
    as: 'company',
    sourceKey: 'id'
  });

  // Define the association with AdsConfig model
  User.hasMany(models.AdsConfig, {
    foreignKey: 'updatedBy',
    as: 'updatedAdsConfigs',
    sourceKey: 'id'
  });
};

module.exports = User; 