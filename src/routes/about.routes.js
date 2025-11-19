const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/about.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', aboutController.getAboutContent);
router.get('/stats', aboutController.getAboutStats);
router.get('/team', aboutController.getAboutTeam);

// Admin routes
router.put('/', isAuthenticated, isAdmin, aboutController.updateAboutContent);

module.exports = router; 