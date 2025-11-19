const express = require('express');
const router = express.Router();
const schemaController = require('../controllers/schema.controller');

// Job posting schema
router.get('/job/:jobId', schemaController.getJobPostingSchema);

// Breadcrumb schema for different page types
router.get('/breadcrumb/:pageType/:slug', schemaController.getBreadcrumbSchema);

// Organization schema for companies
router.get('/organization/:companySlug', schemaController.getOrganizationSchema);

// Website schema for homepage
router.get('/website', schemaController.getWebsiteSchema);

// Combined schemas for pages
router.get('/job-page/:jobSlug', schemaController.getJobPageSchemas);
router.get('/company-page/:companySlug', schemaController.getCompanyPageSchemas);

// FAQ schema
router.get('/faq', schemaController.getFAQSchema);

// Schema validation
router.post('/validate', schemaController.validateSchema);

// Debug endpoint to list available jobs
router.get('/debug/jobs', schemaController.listJobs);

module.exports = router; 