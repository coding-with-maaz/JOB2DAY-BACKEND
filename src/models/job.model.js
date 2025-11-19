const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('../utils/slugify');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salary: {
    type: DataTypes.STRING,
    allowNull: true
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship'),
    allowNull: false
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: true
  },
  skills: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'draft'),
    defaultValue: 'active'
  },
  employerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Companies',
      key: 'id'
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seoTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seoDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  applyLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  vacancy: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: true
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: true
  },
  applyBefore: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
  }, {
    tableName: 'Jobs',
  timestamps: true,
  indexes: [
    // Essential unique index
    { 
      unique: true, 
      fields: ['slug'],
      name: 'jobs_slug'
    },
    
    // Most important composite indexes
    { 
      fields: ['status', 'isFeatured', 'createdAt'],
      name: 'jobs_status_isFeatured_createdAt'
    },
    { 
      fields: ['status', 'jobType', 'location'],
      name: 'jobs_status_jobType_location'
    },
    { 
      fields: ['status', 'title', 'location'],
      name: 'jobs_status_title_location'
    }
  ],
  hooks: {
    beforeValidate: async (job, options) => {
      if (job.title && !job.slug) {
        // Generate base slug
        let baseSlug = slugify(job.title);
        let slug = baseSlug;
        let counter = 1;

        // Check if slug exists and append number if it does
        while (true) {
          const existingJob = await Job.findOne({ where: { slug } });
          if (!existingJob) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        job.slug = slug;
      }
    }
  }
});

// Define associations
Job.associate = (models) => {
  // Define the association with User model
  Job.belongsTo(models.User, { 
    foreignKey: 'employerId',
    targetKey: 'id',
    as: 'postedJobs'
  });

  // Define the association with Company model
  Job.belongsTo(models.Company, { 
    foreignKey: 'companyId',
    targetKey: 'id',
    as: 'company'
  });

  // Define the many-to-many association with Category model
  Job.belongsToMany(models.Category, { 
    through: 'job_categories',
    foreignKey: 'jobId',
    otherKey: 'categoryId',
    as: 'jobCategories'
  });

  // Define the association with JobApplication model
  Job.hasMany(models.JobApplication, {
    foreignKey: 'jobId',
    sourceKey: 'id',
    as: 'applications'
  });
};

module.exports = Job; 