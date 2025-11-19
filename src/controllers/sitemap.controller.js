const Job = require('../models/job.model');
const Company = require('../models/company.model');
const Category = require('../models/category.model');

const BASE_URL = 'https://harpaljob.com'; // Change to your actual domain

exports.generateSitemap = async (req, res) => {
  try {
    // Fetch all active jobs, companies, and categories
    const [jobs, companies, categories] = await Promise.all([
      Job.findAll({ where: { status: 'active' }, attributes: ['slug', 'updatedAt'] }),
      Company.findAll({ where: { status: 'active' }, attributes: ['slug', 'updatedAt'] }),
      Category.findAll({ where: { isActive: true }, attributes: ['slug', 'updatedAt'] }),
    ]);

    // Static pages
    const staticUrls = [
      { loc: `${BASE_URL}/`, lastmod: new Date().toISOString() },
      // Add more static pages as needed
    ];

    // Dynamic pages
    const jobUrls = jobs.map(job => ({
      loc: `${BASE_URL}/jobs/${job.slug}`,
      lastmod: job.updatedAt ? job.updatedAt.toISOString() : undefined,
    }));

    const companyUrls = companies.map(company => ({
      loc: `${BASE_URL}/companies/${company.slug}`,
      lastmod: company.updatedAt ? company.updatedAt.toISOString() : undefined,
    }));

    const categoryUrls = categories.map(category => ({
      loc: `${BASE_URL}/categories/${category.slug}`,
      lastmod: category.updatedAt ? category.updatedAt.toISOString() : undefined,
    }));

    // Combine all URLs
    const urls = [...staticUrls, ...jobUrls, ...companyUrls, ...categoryUrls];

    // Build XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => 
      `<url>\n    <loc>${u.loc}</loc>\n    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}\n  </url>`).join('\n')}\n</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
}; 