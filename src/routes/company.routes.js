const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', companyController.getAllCompanies);
router.get('/:slug', companyController.getCompanyBySlug);

// Admin routes
router.post('/', isAuthenticated, isAdmin, companyController.createCompany);
router.put('/:slug', isAuthenticated, isAdmin, companyController.updateCompany);
router.delete('/:slug/jobs', isAuthenticated, isAdmin, companyController.deleteCompanyJobs);
router.delete('/:slug', isAuthenticated, isAdmin, companyController.deleteCompany);

module.exports = router; 