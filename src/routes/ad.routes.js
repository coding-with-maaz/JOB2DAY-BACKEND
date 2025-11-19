const express = require('express');
const router = express.Router();
const adController = require('../controllers/ad.controller');
const { authenticateToken, authorizeRole } = require('../middleware');

// Public route to get active ads by location
router.get('/location/:location', adController.getActiveAdsByLocation);

// Admin only routes for ad management
router.route('/')
  .post(authenticateToken, authorizeRole(['admin']), adController.createAd) // Create a new ad
  .get(authenticateToken, authorizeRole(['admin']), adController.getAllAds); // Get all ads

router.route('/:id')
  .get(authenticateToken, authorizeRole(['admin']), adController.getAdById) // Get ad by ID
  .put(authenticateToken, authorizeRole(['admin']), adController.updateAd) // Update ad by ID
  .delete(authenticateToken, authorizeRole(['admin']), adController.deleteAd); // Delete ad by ID

module.exports = router; 