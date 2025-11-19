const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const slugify = require('../utils/slugify');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  founded: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  benefits: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'suspended'),
    defaultValue: 'pending'
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
  ogTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ogDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ogImageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  canonicalUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  schema: {
    type: DataTypes.JSON,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
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
  tableName: 'Companies', // Ensure correct table name
  timestamps: true,
  indexes: [
    { unique: true, fields: ['name'] },
    { unique: true, fields: ['slug'] },
    { fields: ['industry'] },
    { fields: ['location'] },
    { fields: ['status'] },
    { fields: ['featured'] }
  ],
  hooks: {
    beforeCreate: async (company) => {
      // Generate base slug
      let baseSlug = slugify(company.name);
      let slug = baseSlug;
      let counter = 1;

      // Check if slug exists and append number if it does
      while (true) {
        const existingCompany = await Company.findOne({ where: { slug } });
        if (!existingCompany) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      company.slug = slug;
    },
    beforeUpdate: async (company) => {
      if (company.changed('name')) {
        // Generate base slug
        let baseSlug = slugify(company.name);
        let slug = baseSlug;
        let counter = 1;

        // Check if slug exists (excluding current company) and append number if it does
        while (true) {
          const existingCompany = await Company.findOne({
            where: {
              slug,
              id: { [Op.ne]: company.id }
            }
          });
          if (!existingCompany) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        company.slug = slug;
      }
    }
  }
});

// Define associations
Company.associate = (models) => {
  Company.hasMany(models.Job, { foreignKey: 'companyId', as: 'companyJobs' });
};

module.exports = Company; 