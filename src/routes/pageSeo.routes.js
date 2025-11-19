const express = require('express');
const router = express.Router();
const pageSeoController = require('../controllers/pageSeo.controller');
const { authenticateToken, authorizeRole } = require('../middleware');

// Public route to get SEO settings for a specific page
router.get('/:pageName', pageSeoController.getPageSeo);

// Admin only route to update SEO settings for a specific page
router.put('/:pageName', authenticateToken, authorizeRole('admin'), pageSeoController.updatePageSeo);

module.exports = router; 