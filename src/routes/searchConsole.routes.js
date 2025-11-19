const express = require('express');
const router = express.Router();
const searchConsoleController = require('../controllers/searchConsole.controller');

// Ping sitemap to search engines
router.post('/ping-sitemap', searchConsoleController.pingSitemap);

// Submit URLs to Google Indexing API
router.post('/submit-job/:jobId', searchConsoleController.submitJobToIndexing);
router.post('/submit-company/:companySlug', searchConsoleController.submitCompanyToIndexing);
router.post('/submit-urls', searchConsoleController.submitMultipleUrls);

// Validate rich results
router.post('/validate-rich-results/:url', searchConsoleController.validateRichResults);

// Generate reports
router.get('/report', searchConsoleController.generateReport);

// Check indexing status
router.get('/indexing-status/:url', searchConsoleController.checkIndexingStatus);

// Bulk operations
router.post('/bulk-submit-jobs', searchConsoleController.bulkSubmitNewJobs);

module.exports = router; 