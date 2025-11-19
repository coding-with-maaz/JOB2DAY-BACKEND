const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('../utils/slugify'); // Import the slugify utility

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'categories',
  indexes: [
    { unique: true, fields: ['name'] },
    { unique: true, fields: ['slug'] },
    { fields: ['isActive'] }
  ],
  hooks: {
    beforeCreate: async (category) => {
      // Check for existing category with same name
      const existingCategory = await Category.findOne({ 
        where: { name: category.name }
      });
      if (existingCategory) {
        throw new Error('A category with this name already exists');
      }

      // Generate base slug
      let baseSlug = slugify(category.name);
      let slug = baseSlug;
      let counter = 1;

      // Check if slug exists and append number if it does
      while (true) {
        const existingSlug = await Category.findOne({ where: { slug } });
        if (!existingSlug) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      category.slug = slug;
    },
    beforeUpdate: async (category) => {
      if (category.changed('name')) {
        // Check for existing category with same name (excluding current category)
        const existingCategory = await Category.findOne({
          where: {
            name: category.name,
            id: { [sequelize.Op.ne]: category.id }
          }
        });
        if (existingCategory) {
          throw new Error('A category with this name already exists');
        }

        // Generate base slug
        let baseSlug = slugify(category.name);
        let slug = baseSlug;
        let counter = 1;

        // Check if slug exists (excluding current category) and append number if it does
        while (true) {
          const existingSlug = await Category.findOne({
            where: {
              slug,
              id: { [sequelize.Op.ne]: category.id }
            }
          });
          if (!existingSlug) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        category.slug = slug;
      }
    }
  }
});

// Define associations
Category.associate = (models) => {
  Category.belongsToMany(models.Job, { 
    through: 'job_categories',
    foreignKey: 'category_id',
    otherKey: 'job_id',
    as: 'categoryJobs'
  });
};

module.exports = Category; 