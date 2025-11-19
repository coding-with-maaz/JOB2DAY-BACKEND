const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Protected routes (admin only)
router.post('/', authenticateToken, authorizeRole(['admin']), categoryController.createCategory);
router.put('/:id', authenticateToken, authorizeRole(['admin']), categoryController.updateCategory);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), categoryController.deleteCategory);

module.exports = router; 