const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public routes
router.post('/submit', contactController.submitContactForm);
router.get('/info', contactController.getContactInfo);
router.get('/faqs', contactController.getFAQs);

// Admin routes
router.get('/submissions', isAuthenticated, isAdmin, contactController.getAllContactSubmissions);
router.put('/submissions/:id/status', isAuthenticated, isAdmin, contactController.updateContactStatus);
router.put('/info/:id', isAuthenticated, isAdmin, contactController.updateContactInfo);
router.post('/info', isAuthenticated, isAdmin, contactController.updateContactInfo);
router.put('/faqs/:id', isAuthenticated, isAdmin, contactController.updateFAQ);
router.post('/faqs', isAuthenticated, isAdmin, contactController.updateFAQ);
router.delete('/faqs/:id', isAuthenticated, isAdmin, contactController.deleteFAQ);

module.exports = router; 