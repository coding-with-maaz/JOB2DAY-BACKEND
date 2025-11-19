const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// User routes (authenticated)
router.post('/save-fcm-token', isAuthenticated, NotificationController.saveFcmToken);
router.post('/remove-fcm-token', isAuthenticated, NotificationController.removeFcmToken);

// Admin routes (admin only)
router.post('/admin/test-notification', isAuthenticated, isAdmin, NotificationController.sendTestNotification);
router.post('/admin/trigger-daily', isAuthenticated, isAdmin, NotificationController.triggerDailyNotification);
router.post('/admin/trigger-cleanup', isAuthenticated, isAdmin, NotificationController.triggerTokenCleanup);
router.get('/admin/scheduler-status', isAuthenticated, isAdmin, NotificationController.getSchedulerStatus);
router.post('/admin/restart-scheduler', isAuthenticated, isAdmin, NotificationController.restartScheduler);
router.get('/admin/stats', isAuthenticated, isAdmin, NotificationController.getNotificationStats);
router.post('/admin/welcome-notification', isAuthenticated, isAdmin, NotificationController.sendWelcomeNotification);
router.post('/admin/application-status', isAuthenticated, isAdmin, NotificationController.sendApplicationStatusNotification);

module.exports = router; 