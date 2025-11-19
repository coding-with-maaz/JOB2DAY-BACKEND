const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { authenticateToken, authorizeRole } = require('../middleware');

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/featured', jobController.getFeaturedJobs);
router.get('/category/:categoryId', jobController.getJobsByCategory);
router.get('/country/:country', jobController.getJobsByCountry);
router.get('/countries', jobController.getAllCountries);
router.get('/company/:companyName', jobController.getJobsByCompanyName);
router.get('/total', jobController.getTotalJobs);
router.get('/categories/total', jobController.getTotalCategories);
router.get('/today', jobController.getTodayJobs);
router.get('/:id', jobController.getJobById);
router.get('/slug/:slug', jobController.getJobBySlug);

// Job application routes
router.post('/:id/quick-apply', jobController.quickApply);
router.post('/:id/apply', authenticateToken, jobController.applyForJob);

// Email test route (admin only)
router.post('/test-email', authenticateToken, authorizeRole(['admin']), jobController.testEmail);

// Protected routes
router.post('/', authenticateToken, authorizeRole(['employer', 'admin']), jobController.createJob);
router.put('/:slug', authenticateToken, authorizeRole(['employer', 'admin']), jobController.updateJobBySlug);
router.delete('/:slug', authenticateToken, authorizeRole(['employer', 'admin']), jobController.deleteJobBySlug);

module.exports = router; 