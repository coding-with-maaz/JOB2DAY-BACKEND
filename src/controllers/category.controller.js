const { Category, Job, User } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const slugify = require('../utils/slugify');

// Create a new category (Admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Generate slug from name
    const slug = slugify(name);

    const category = await Category.create({
      name,
      slug,
      description,
      isActive: true
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.message === 'A category with this name already exists') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error creating category' });
    }
  }
};

// Get all categories (optimized with caching)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'description', 'isActive'] // Select only needed fields
    });

    const result = {
      categories: categories,
      total: categories.length
    };

    // Add caching headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'ETag': `"categories-${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Job,
          as: 'categoryJobs',
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: User,
              as: 'postedJobs',
              attributes: ['id', 'companyName', 'logoUrl']
            }
          ]
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
};

// Get category by Slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: Job,
          as: 'categoryJobs',
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: User,
              as: 'postedJobs',
              attributes: ['id', 'companyName', 'logoUrl']
            }
          ]
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get the total count of active jobs in this category
    const jobCount = await category.countCategoryJobs({
      where: { status: 'active' }
    });

    // Add jobCount to the response
    const response = {
      ...category.toJSON(),
      jobCount
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
};

// Update category (Admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const categoryId = req.params.id;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.message === 'A category with this name already exists') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error updating category' });
    }
  }
};

// Delete category (Admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has associated jobs
    const jobCount = await category.countCategoryJobs();
    if (jobCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with associated jobs. Please reassign or delete the jobs first.'
      });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
};

// Remove the uploadIcon function since we no longer have iconUrl
exports.uploadIcon = async (req, res) => {
  res.status(501).json({ message: 'Icon upload is no longer supported' });
}; 