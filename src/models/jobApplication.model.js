const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

class JobApplication extends Model {}

JobApplication.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Jobs',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  resumeUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: {
        msg: 'Resume URL must be a valid URL'
      }
    }
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewing', 'shortlisted', 'rejected', 'hired'),
    defaultValue: 'pending'
  },
  appliedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'JobApplication',
  tableName: 'job_applications',
  timestamps: true,
  indexes: [
    {
      fields: ['jobId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    }
  ]
});

// Define associations
JobApplication.associate = (models) => {
  JobApplication.belongsTo(models.Job, { 
    foreignKey: 'jobId', 
    as: 'applicationJob',
    targetKey: 'id'
  });
  JobApplication.belongsTo(models.User, { 
    foreignKey: 'userId', 
    as: 'applicationUser',
    targetKey: 'id'
  });
};

module.exports = JobApplication;