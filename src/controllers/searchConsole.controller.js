const searchConsoleService = require('../services/searchConsoleService');
const Job = require('../models/job.model');
const Company = require('../models/company.model');

/**
 * Ping search engines about sitemap updates
 */
exports.pingSitemap = async (req, res) => {
  try {
    const sitemapUrl = 'https://harpaljob.com/sitemap';
    const results = await searchConsoleService.pingSearchEngines(sitemapUrl);
    
    res.json({
      success: true,
      message: 'Sitemap pinged to search engines',
      results: results
    });
  } catch (error) {
    console.error('Error pinging sitemap:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error pinging sitemap',
      error: error.message 
    });
  }
};

/**
 * Submit a job URL to Google Indexing API
 */
exports.submitJobToIndexing = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findByPk(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const jobUrl = `https://harpaljob.com/jobs/${job.slug}`;
    const result = await searchConsoleService.submitToIndexingAPI(jobUrl, 'URL_UPDATED');
    
    res.json({
      success: true,
      message: 'Job submitted to Google Indexing API',
      jobUrl: jobUrl,
      result: result
    });
  } catch (error) {
    console.error('Error submitting job to indexing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting job to indexing',
      error: error.message 
    });
  }
};

/**
 * Submit a company URL to Google Indexing API
 */
exports.submitCompanyToIndexing = async (req, res) => {
  try {
    const { companySlug } = req.params;
    const company = await Company.findOne({ where: { slug: companySlug } });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const companyUrl = `https://harpaljob.com/companies/${company.slug}`;
    const result = await searchConsoleService.submitToIndexingAPI(companyUrl, 'URL_UPDATED');
    
    res.json({
      success: true,
      message: 'Company submitted to Google Indexing API',
      companyUrl: companyUrl,
      result: result
    });
  } catch (error) {
    console.error('Error submitting company to indexing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting company to indexing',
      error: error.message 
    });
  }
};

/**
 * Submit multiple URLs to Google Indexing API
 */
exports.submitMultipleUrls = async (req, res) => {
  try {
    const { urls, type = 'URL_UPDATED' } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ message: 'URLs array is required' });
    }

    const results = await searchConsoleService.submitMultipleUrls(urls, type);
    
    res.json({
      success: true,
      message: 'URLs submitted to Google Indexing API',
      totalSubmitted: urls.length,
      results: results
    });
  } catch (error) {
    console.error('Error submitting multiple URLs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting URLs to indexing',
      error: error.message 
    });
  }
};

/**
 * Validate rich results for a URL
 */
exports.validateRichResults = async (req, res) => {
  try {
    const { url } = req.params;
    const { html } = req.body;
    
    const result = await searchConsoleService.validateRichResults(url, html);
    
    res.json({
      success: true,
      message: 'Rich results validation completed',
      result: result
    });
  } catch (error) {
    console.error('Error validating rich results:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error validating rich results',
      error: error.message 
    });
  }
};

/**
 * Generate Search Console report
 */
exports.generateReport = async (req, res) => {
  try {
    // Get all active jobs and companies
    const [jobs, companies] = await Promise.all([
      Job.findAll({ where: { status: 'active' }, attributes: ['slug'] }),
      Company.findAll({ where: { status: 'active' }, attributes: ['slug'] })
    ]);

    const urls = [
      'https://harpaljob.com/',
      'https://harpaljob.com/jobs',
      'https://harpaljob.com/companies',
      'https://harpaljob.com/categories',
      ...jobs.map(job => `https://harpaljob.com/jobs/${job.slug}`),
      ...companies.map(company => `https://harpaljob.com/companies/${company.slug}`)
    ];

    const report = await searchConsoleService.generateSearchConsoleReport(urls);
    
    res.json({
      success: true,
      message: 'Search Console report generated',
      report: report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating report',
      error: error.message 
    });
  }
};

/**
 * Check indexing status for a URL
 */
exports.checkIndexingStatus = async (req, res) => {
  try {
    const { url } = req.params;
    const result = await searchConsoleService.checkIndexingStatus(url);
    
    res.json({
      success: true,
      message: 'Indexing status checked',
      result: result
    });
  } catch (error) {
    console.error('Error checking indexing status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking indexing status',
      error: error.message 
    });
  }
};

/**
 * Bulk submit new jobs to indexing API
 */
exports.bulkSubmitNewJobs = async (req, res) => {
  try {
    const { days = 1 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const newJobs = await Job.findAll({
      where: {
        status: 'active',
        createdAt: {
          [require('sequelize').Op.gte]: cutoffDate
        }
      },
      attributes: ['slug']
    });

    const jobUrls = newJobs.map(job => `https://harpaljob.com/jobs/${job.slug}`);
    const results = await searchConsoleService.submitMultipleUrls(jobUrls, 'URL_UPDATED');
    
    res.json({
      success: true,
      message: 'New jobs submitted to Google Indexing API',
      totalJobs: newJobs.length,
      days: days,
      results: results
    });
  } catch (error) {
    console.error('Error bulk submitting jobs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error bulk submitting jobs',
      error: error.message 
    });
  }
}; 