const SEO = require('../models/seo.model');

// Get all SEO settings
exports.getAllSEO = async (req, res) => {
  try {
    const seo = await SEO.findAll();
    res.json(seo);
  } catch (error) {
    console.error('Error fetching all SEO settings:', error);
    res.status(500).json({ message: 'Error fetching all SEO settings' });
  }
};

// Get SEO settings by type
exports.getSEOByType = async (req, res) => {
  try {
    const { type } = req.params;
    let seo = await SEO.findOne({ where: { type } });
    
    if (!seo) {
      // Create default settings if they don't exist
      const defaultSettings = {
        'global': {
          siteTitle: 'HarPalJob - Find Jobs Near You',
          siteDescription: 'Find your dream job near you. Browse thousands of job listings and connect with top employers.',
          keywords: 'jobs, employment, career, hiring, job search, local jobs',
          robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/',
          sitemapEnabled: true,
          googleAnalyticsId: 'UA-XXXXXXXXX-X'
        },
        'homepage': {
          homepageTitle: 'Find Jobs Near You | HarPalJob',
          homepageDescription: 'Search and apply for jobs in your area. Browse through thousands of job listings from top employers.',
          ogTitle: 'Find Jobs Near You | HarPalJob',
          ogDescription: 'Search and apply for jobs in your area. Browse through thousands of job listings from top employers.',
          ogImage: 'https://harpaljob.com/og-image.jpg'
        },
        'job-listing': {
          jobTitleTemplate: '{jobTitle} at {companyName} | HarPalJob',
          jobDescriptionTemplate: 'Apply for {jobTitle} at {companyName}. {jobDescription}',
          ogTitleTemplate: '{jobTitle} at {companyName} | HarPalJob',
          ogDescriptionTemplate: 'Apply for {jobTitle} at {companyName}. {jobDescription}',
          ogImageTemplate: '{companyLogo}'
        },
        'companies': {
          companiesTitle: 'Top Companies Hiring | HarPalJob',
          companiesDescription: 'Discover top companies actively hiring on HarPalJob. Find your dream employer and explore current job opportunities.',
          companiesOgTitle: 'Top Companies Hiring | HarPalJob',
          companiesOgDescription: 'Discover top companies actively hiring on HarPalJob. Find your dream employer and explore current job opportunities.',
          companiesOgImage: 'https://harpaljob.com/og-image.jpg'
        },
        'categories': {
          categoriesTitle: 'Browse Jobs by Category | HarPalJob',
          categoriesDescription: 'Explore job opportunities by category. Find the perfect job that matches your skills and interests.',
          categoriesOgTitle: 'Browse Jobs by Category | HarPalJob',
          categoriesOgDescription: 'Explore job opportunities by category. Find the perfect job that matches your skills and interests.',
          categoriesOgImage: 'https://harpaljob.com/og-image.jpg'
        },
        'about': {
          aboutTitle: 'About HarPalJob | Your Job Search Partner',
          aboutDescription: 'Learn about HarPalJob\'s mission to connect job seekers with their dream opportunities. Discover our story and commitment to your career success.',
          aboutOgTitle: 'About HarPalJob | Your Job Search Partner',
          aboutOgDescription: 'Learn about HarPalJob\'s mission to connect job seekers with their dream opportunities. Discover our story and commitment to your career success.',
          aboutOgImage: 'https://harpaljob.com/og-image.jpg'
        },
        'contact': {
          contactTitle: 'Contact HarPalJob | Get in Touch',
          contactDescription: 'Contact HarPalJob for support, partnerships, or inquiries. We\'re here to help you with your job search journey.',
          contactOgTitle: 'Contact HarPalJob | Get in Touch',
          contactOgDescription: 'Contact HarPalJob for support, partnerships, or inquiries. We\'re here to help you with your job search journey.',
          contactOgImage: 'https://harpaljob.com/og-image.jpg'
        }
      };

      if (defaultSettings[type]) {
        seo = await SEO.create({ type, ...defaultSettings[type] });
      } else {
        return res.status(404).json({ message: 'Invalid SEO type' });
      }
    }
    
    res.json(seo);
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    res.status(500).json({ message: 'Error fetching SEO settings' });
  }
};

// Update SEO settings by type
exports.updateSEOByType = async (req, res) => {
  try {
    const { type } = req.params;
    const seoData = req.body;

    // Validate required fields based on type
    const requiredFields = {
      'global': ['siteTitle', 'siteDescription'],
      'homepage': ['homepageTitle', 'homepageDescription'],
      'job-listing': ['jobTitleTemplate', 'jobDescriptionTemplate'],
      'companies': ['companiesTitle', 'companiesDescription'],
      'categories': ['categoriesTitle', 'categoriesDescription'],
      'about': ['aboutTitle', 'aboutDescription'],
      'contact': ['contactTitle', 'contactDescription']
    };

    const fields = requiredFields[type];
    if (!fields) {
      return res.status(400).json({ message: 'Invalid SEO type' });
    }

    for (const field of fields) {
      if (!seoData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Find existing SEO settings
    let seo = await SEO.findOne({ where: { type } });
    
    if (seo) {
      // Update existing settings
      await seo.update(seoData);
    } else {
      // Create new settings
      seo = await SEO.create({ ...seoData, type });
    }
    
    res.json(seo);
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    res.status(500).json({ message: 'Error updating SEO settings' });
  }
};

// Delete SEO settings by type
exports.deleteSEOByType = async (req, res) => {
  try {
    const { type } = req.params;
    const seo = await SEO.findOne({ where: { type } });
    
    if (!seo) {
      return res.status(404).json({ message: 'SEO settings not found' });
    }
    
    await seo.destroy();
    res.json({ message: 'SEO settings deleted successfully' });
  } catch (error) {
    console.error('Error deleting SEO settings:', error);
    res.status(500).json({ message: 'Error deleting SEO settings' });
  }
}; 