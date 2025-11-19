const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const analyticsController = require('../controllers/analytics.controller');

// Track an analytics event
router.post('/track', analyticsController.trackEvent);

// Get analytics data (Admin only)
router.get('/', isAuthenticated, isAdmin, analyticsController.getAnalytics);

// Get analytics summary (Admin only)
router.get('/summary', isAuthenticated, isAdmin, analyticsController.getAnalyticsSummary);

// Get dashboard stats (Admin only)
router.get('/dashboard', isAuthenticated, isAdmin, analyticsController.getDashboardStats);

// Get job stats (Admin only)
router.get('/jobs', isAuthenticated, isAdmin, analyticsController.getJobStats);

// Get user stats (Admin only)
router.get('/users', isAuthenticated, isAdmin, analyticsController.getUserStats);

module.exports = router; 