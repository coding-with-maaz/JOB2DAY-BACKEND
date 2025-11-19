const express = require('express');
const router = express.Router();
const AdsConfigController = require('../controllers/adsConfig.controller');
const { isAuthenticated } = require('../middleware/auth');

// Public endpoint - Get current ads config (no authentication required)
router.get('/ads-config', AdsConfigController.getConfig);

// Admin endpoints (require authentication)
router.get('/admin/ads-config', isAuthenticated, AdsConfigController.getAllConfigs);
router.get('/admin/ads-config/:environment', isAuthenticated, AdsConfigController.getConfigByEnvironment);
router.put('/admin/ads-config', isAuthenticated, AdsConfigController.updateConfig);
router.delete('/admin/ads-config/:id', isAuthenticated, AdsConfigController.deleteConfig);
router.post('/admin/ads-config/reset', isAuthenticated, AdsConfigController.resetConfig);

module.exports = router; 