const schemaService = require('../services/schemaService');
const Job = require('../models/job.model');
const Company = require('../models/company.model');
const Category = require('../models/category.model');

/**
 * Get job posting schema for a specific job
 */
exports.getJobPostingSchema = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Try to find job by ID first (numeric), then by slug
    let job = await Job.findByPk(jobId, {
      include: [{ model: Company, as: 'company' }]
    });

    // If not found by ID, try to find by slug
    if (!job) {
      job = await Job.findOne({ 
        where: { slug: jobId },
        include: [{ model: Company, as: 'company' }]
      });
    }

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const schema = await schemaService.generateJobPostingSchema(job, job.company);
    res.json(schema);
  } catch (error) {
    console.error('Error generating job posting schema:', error);
    res.status(500).json({ message: 'Error generating job posting schema' });
  }
};

/**
 * Get breadcrumb schema for a specific page
 */
exports.getBreadcrumbSchema = async (req, res) => {
  try {
    const { pageType, slug } = req.params;
    let breadcrumbs = [];

    switch (pageType) {
      case 'job':
        const job = await Job.findOne({ where: { slug } });
        if (!job) {
          return res.status(404).json({ message: 'Job not found' });
        }
        breadcrumbs = [
          { name: 'Home', url: 'https://harpaljob.com/' },
          { name: 'Jobs', url: 'https://harpaljob.com/jobs' },
          { name: job.title, url: `https://harpaljob.com/jobs/${job.slug}` }
        ];
        break;

      case 'company':
        const company = await Company.findOne({ where: { slug } });
        if (!company) {
          return res.status(404).json({ message: 'Company not found' });
        }
        breadcrumbs = [
          { name: 'Home', url: 'https://harpaljob.com/' },
          { name: 'Companies', url: 'https://harpaljob.com/companies' },
          { name: company.name, url: `https://harpaljob.com/companies/${company.slug}` }
        ];
        break;

      case 'category':
        const category = await Category.findOne({ where: { slug } });
        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        }
        breadcrumbs = [
          { name: 'Home', url: 'https://harpaljob.com/' },
          { name: 'Categories', url: 'https://harpaljob.com/categories' },
          { name: category.name, url: `https://harpaljob.com/categories/${category.slug}` }
        ];
        break;

      default:
        return res.status(400).json({ message: 'Invalid page type' });
    }

    const schema = schemaService.generateBreadcrumbSchema(breadcrumbs);
    res.json(schema);
  } catch (error) {
    console.error('Error generating breadcrumb schema:', error);
    res.status(500).json({ message: 'Error generating breadcrumb schema' });
  }
};

/**
 * Get organization schema for a company
 */
exports.getOrganizationSchema = async (req, res) => {
  try {
    const { companySlug } = req.params;
    const company = await Company.findOne({ where: { slug: companySlug } });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const schema = schemaService.generateOrganizationSchema(company);
    res.json(schema);
  } catch (error) {
    console.error('Error generating organization schema:', error);
    res.status(500).json({ message: 'Error generating organization schema' });
  }
};

/**
 * Get website schema for homepage
 */
exports.getWebsiteSchema = async (req, res) => {
  try {
    const schema = schemaService.generateWebsiteSchema();
    res.json(schema);
  } catch (error) {
    console.error('Error generating website schema:', error);
    res.status(500).json({ message: 'Error generating website schema' });
  }
};

/**
 * Get all schemas for a job page (job posting + breadcrumbs)
 */
exports.getJobPageSchemas = async (req, res) => {
  try {
    const { jobSlug } = req.params;
    const job = await Job.findOne({ 
      where: { slug: jobSlug },
      include: [{ model: Company, as: 'company' }]
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const breadcrumbs = [
      { name: 'Home', url: 'https://harpaljob.com/' },
      { name: 'Jobs', url: 'https://harpaljob.com/jobs' },
      { name: job.title, url: `https://harpaljob.com/jobs/${job.slug}` }
    ];

    const schemas = await schemaService.generateJobPageSchemas(job, breadcrumbs);
    res.json(schemas);
  } catch (error) {
    console.error('Error generating job page schemas:', error);
    res.status(500).json({ message: 'Error generating job page schemas' });
  }
};

/**
 * Get all schemas for a company page (organization + breadcrumbs)
 */
exports.getCompanyPageSchemas = async (req, res) => {
  try {
    const { companySlug } = req.params;
    const company = await Company.findOne({ where: { slug: companySlug } });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const breadcrumbs = [
      { name: 'Home', url: 'https://harpaljob.com/' },
      { name: 'Companies', url: 'https://harpaljob.com/companies' },
      { name: company.name, url: `https://harpaljob.com/companies/${company.slug}` }
    ];

    const schemas = schemaService.generateCompanyPageSchemas(company, breadcrumbs);
    res.json(schemas);
  } catch (error) {
    console.error('Error generating company page schemas:', error);
    res.status(500).json({ message: 'Error generating company page schemas' });
  }
};

/**
 * Get FAQ schema
 */
exports.getFAQSchema = async (req, res) => {
  try {
    // This would typically come from your FAQ model
    // For now, using example data
    const faqs = [
      {
        question: "How do I apply for a job?",
        answer: "Click on the 'Apply Now' button on any job listing to submit your application."
      },
      {
        question: "How can I create a company profile?",
        answer: "Register as an employer and follow the steps to create your company profile."
      }
    ];

    const schema = schemaService.generateFAQSchema(faqs);
    res.json(schema);
  } catch (error) {
    console.error('Error generating FAQ schema:', error);
    res.status(500).json({ message: 'Error generating FAQ schema' });
  }
};

/**
 * Validate schema markup
 */
exports.validateSchema = async (req, res) => {
  try {
    const { schema } = req.body;
    
    if (!schema) {
      return res.status(400).json({ message: 'Schema is required' });
    }

    // Basic validation - you might want to use a schema validation library
    const isValid = schema['@context'] === 'https://schema.org' && schema['@type'];
    
    res.json({
      isValid,
      message: isValid ? 'Schema is valid' : 'Schema is invalid',
      schema
    });
  } catch (error) {
    console.error('Error validating schema:', error);
    res.status(500).json({ message: 'Error validating schema' });
  }
};

/**
 * Debug endpoint to list available jobs (for testing)
 */
exports.listJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { status: 'active' },
      attributes: ['id', 'title', 'slug'],
      limit: 10
    });
    
    res.json({
      message: 'Available jobs for testing',
      jobs: jobs
    });
  } catch (error) {
    console.error('Error listing jobs:', error);
    res.status(500).json({ message: 'Error listing jobs' });
  }
}; 