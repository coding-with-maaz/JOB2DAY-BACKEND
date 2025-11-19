const schemaService = require('../services/schemaService');

/**
 * Middleware to inject schema markup into HTML responses
 * This should be used after your main route handlers
 */
const injectSchemaMiddleware = async (req, res, next) => {
  // Store the original send function
  const originalSend = res.send;

  // Override the send function to inject schema
  res.send = async function(data) {
    try {
      // Only process HTML responses
      if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
        const schemas = await generateSchemasForPage(req);
        
        if (schemas && Object.keys(schemas).length > 0) {
          const schemaScripts = Object.values(schemas)
            .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
            .join('\n');
          
          // Inject schema scripts before closing head tag
          data = data.replace('</head>', `${schemaScripts}\n</head>`);
        }
      }
      
      // Call the original send function
      return originalSend.call(this, data);
    } catch (error) {
      console.error('Error injecting schema:', error);
      // Fallback to original send if there's an error
      return originalSend.call(this, data);
    }
  };

  next();
};

/**
 * Generate schemas based on the current page
 */
async function generateSchemasForPage(req) {
  const path = req.path;
  const schemas = {};

  try {
    // Homepage
    if (path === '/' || path === '/home') {
      schemas.website = schemaService.generateWebsiteSchema();
    }
    
    // Job detail page
    else if (path.match(/^\/jobs\/[^\/]+$/)) {
      const jobSlug = path.split('/')[2];
      const Job = require('../models/job.model');
      const Company = require('../models/company.model');
      
      const job = await Job.findOne({ 
        where: { slug: jobSlug },
        include: [{ model: Company, as: 'company' }]
      });

      if (job) {
        const breadcrumbs = [
          { name: 'Home', url: 'https://harpaljob.com/' },
          { name: 'Jobs', url: 'https://harpaljob.com/jobs' },
          { name: job.title, url: `https://harpaljob.com/jobs/${job.slug}` }
        ];

        const jobSchemas = await schemaService.generateJobPageSchemas(job, breadcrumbs);
        Object.assign(schemas, jobSchemas);
      }
    }
    
    // Company detail page
    else if (path.match(/^\/companies\/[^\/]+$/)) {
      const companySlug = path.split('/')[2];
      const Company = require('../models/company.model');
      
      const company = await Company.findOne({ where: { slug: companySlug } });

      if (company) {
        const breadcrumbs = [
          { name: 'Home', url: 'https://harpaljob.com/' },
          { name: 'Companies', url: 'https://harpaljob.com/companies' },
          { name: company.name, url: `https://harpaljob.com/companies/${company.slug}` }
        ];

        const companySchemas = schemaService.generateCompanyPageSchemas(company, breadcrumbs);
        Object.assign(schemas, companySchemas);
      }
    }
    
    // Category page
    else if (path.match(/^\/categories\/[^\/]+$/)) {
      const categorySlug = path.split('/')[2];
      const Category = require('../models/category.model');
      
      const category = await Category.findOne({ where: { slug: categorySlug } });

      if (category) {
        const breadcrumbs = [
          { name: 'Home', url: 'https://harpaljob.com/' },
          { name: 'Categories', url: 'https://harpaljob.com/categories' },
          { name: category.name, url: `https://harpaljob.com/categories/${category.slug}` }
        ];

        schemas.breadcrumb = schemaService.generateBreadcrumbSchema(breadcrumbs);
      }
    }
    
    // Jobs listing page
    else if (path === '/jobs') {
      const breadcrumbs = [
        { name: 'Home', url: 'https://harpaljob.com/' },
        { name: 'Jobs', url: 'https://harpaljob.com/jobs' }
      ];
      schemas.breadcrumb = schemaService.generateBreadcrumbSchema(breadcrumbs);
    }
    
    // Companies listing page
    else if (path === '/companies') {
      const breadcrumbs = [
        { name: 'Home', url: 'https://harpaljob.com/' },
        { name: 'Companies', url: 'https://harpaljob.com/companies' }
      ];
      schemas.breadcrumb = schemaService.generateBreadcrumbSchema(breadcrumbs);
    }
    
    // Categories listing page
    else if (path === '/categories') {
      const breadcrumbs = [
        { name: 'Home', url: 'https://harpaljob.com/' },
        { name: 'Categories', url: 'https://harpaljob.com/categories' }
      ];
      schemas.breadcrumb = schemaService.generateBreadcrumbSchema(breadcrumbs);
    }

  } catch (error) {
    console.error('Error generating schemas for page:', error);
  }

  return schemas;
}

/**
 * Middleware to add schema headers for API responses
 */
const addSchemaHeaders = (req, res, next) => {
  // Add headers to indicate schema availability
  res.set({
    'X-Schema-Available': 'true',
    'X-Schema-Types': 'JobPosting,BreadcrumbList,Organization,WebSite'
  });
  next();
};

module.exports = {
  injectSchemaMiddleware,
  addSchemaHeaders
}; 