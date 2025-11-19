const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seo.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Get all SEO settings (admin only)
router.get('/', isAuthenticated, isAdmin, seoController.getAllSEO);

// Get SEO settings by type
router.get('/type/:type', seoController.getSEOByType);

// Update SEO settings by type (admin only)
router.put('/type/:type', isAuthenticated, isAdmin, seoController.updateSEOByType);

// Delete SEO settings by type (admin only)
router.delete('/type/:type', isAuthenticated, isAdmin, seoController.deleteSEOByType);

module.exports = router; 