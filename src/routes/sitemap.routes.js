const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemap.controller');

// Route to generate sitemap
router.get('/', sitemapController.generateSitemap);

module.exports = router; 