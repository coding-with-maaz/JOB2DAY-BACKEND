const { Company, Job, User } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const slugify = require('../utils/slugify');

// Get all companies with job counts
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      attributes: [
        'id', 'name', 'slug', 'industry', 'size', 'location', 
        'description', 'logo', 'founded', 'rating', 'featured',
        'benefits', 'website', 'email', 'phone', 'status',
        'seoTitle', 'seoDescription', 'seoKeywords',
        'ogTitle', 'ogDescription', 'ogImageUrl', 'canonicalUrl',
        'schema',
        [
          sequelize.literal(`(
            SELECT COUNT(DISTINCT j.id)
            FROM Jobs j
            WHERE j.companyId = Company.id
            AND j.status = 'active'
          )`),
          'openJobs'
        ]
      ],
      include: [{
        model: Job,
        as: 'companyJobs',
        required: false,
        where: { status: 'active' },
        attributes: ['id']
      }]
    });

    // Transform the response to ensure openJobs is a number
    const transformedCompanies = companies.map(company => {
      const companyData = company.toJSON();
      companyData.openJobs = parseInt(companyData.openJobs) || 0;
      return companyData;
    });

    res.json(transformedCompanies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Error fetching companies' });
  }
};

// Get company by slug
exports.getCompanyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('Fetching company with slug:', slug);

    const company = await Company.findOne({
      where: { slug },
      attributes: [
        'id', 'name', 'slug', 'industry', 'size', 'location', 
        'description', 'logo', 'founded', 'rating', 'featured',
        'benefits', 'website', 'email', 'phone', 'status',
        'seoTitle', 'seoDescription', 'seoKeywords',
        'ogTitle', 'ogDescription', 'ogImageUrl', 'canonicalUrl',
        'schema'
      ],
      include: [{
        model: Job,
        as: 'companyJobs',
        required: false,
        where: { status: 'active' },
        attributes: [
          'id', 'title', 'slug', 'location', 'salary', 
          'jobType', 'experience', 'createdAt', 'isFeatured'
        ],
        include: [{
          model: User,
          as: 'postedJobs',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }]
      }]
    });

    if (!company) {
      console.log('Company not found with slug:', slug);
      return res.status(404).json({ message: 'Company not found' });
    }

    console.log('Company found:', company.name);
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ 
      message: 'Error fetching company',
      error: error.message 
    });
  }
};

// Create new company (Admin only)
exports.createCompany = async (req, res) => {
  try {
    const {
      name,
      industry,
      size,
      location,
      description,
      logo,
      founded,
      rating,
      featured,
      benefits,
      website,
      email,
      phone,
      status,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogTitle,
      ogDescription,
      ogImageUrl,
      canonicalUrl,
      schema
    } = req.body;

    // Generate slug from name
    const slug = slugify(name);

    const company = await Company.create({
      name,
      slug,
      industry,
      size,
      location,
      description,
      logo,
      founded,
      rating,
      featured,
      benefits,
      website,
      email,
      phone,
      status,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description,
      seoKeywords,
      ogTitle: ogTitle || name,
      ogDescription: ogDescription || description,
      ogImageUrl,
      canonicalUrl,
      schema: schema || {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url: website || '',
        logo: logo || '',
        foundingDate: founded?.toString() || ''
      }
    });

    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ 
      message: 'Error creating company',
      error: error.message 
    });
  }
};

// Update company (Admin only)
exports.updateCompany = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      name,
      industry,
      size,
      location,
      description,
      logo,
      founded,
      rating,
      featured,
      benefits,
      website,
      email,
      phone,
      status,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogTitle,
      ogDescription,
      ogImageUrl,
      canonicalUrl,
      schema
    } = req.body;

    const company = await Company.findOne({ where: { slug } });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await company.update({
      name: name || company.name,
      industry: industry || company.industry,
      size: size || company.size,
      location: location || company.location,
      description: description || company.description,
      logo: logo || company.logo,
      founded: founded || company.founded,
      rating: rating || company.rating,
      featured: featured !== undefined ? featured : company.featured,
      benefits: benefits || company.benefits,
      website: website || company.website,
      email: email || company.email,
      phone: phone || company.phone,
      status: status || company.status,
      seoTitle: seoTitle || company.seoTitle,
      seoDescription: seoDescription || company.seoDescription,
      seoKeywords: seoKeywords || company.seoKeywords,
      ogTitle: ogTitle || company.ogTitle,
      ogDescription: ogDescription || company.ogDescription,
      ogImageUrl: ogImageUrl || company.ogImageUrl,
      canonicalUrl: canonicalUrl || company.canonicalUrl,
      schema: schema || company.schema
    });

    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Error updating company' });
  }
};

// Delete company's jobs (Admin only)
exports.deleteCompanyJobs = async (req, res) => {
  try {
    const { slug } = req.params;
    const company = await Company.findOne({ where: { slug } });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Start a transaction to ensure data consistency
    const result = await sequelize.transaction(async (t) => {
      // First delete all job applications for this company's jobs
      await sequelize.query('DELETE FROM job_applications WHERE jobId IN (SELECT id FROM Jobs WHERE companyId = ?)', {
        replacements: [company.id],
        transaction: t
      });

      // Then delete all jobs associated with this company
      await Job.destroy({
        where: { companyId: company.id },
        transaction: t
      });
    });

    res.json({ message: 'Company jobs and applications deleted successfully' });
  } catch (error) {
    console.error('Error deleting company jobs:', error);
    res.status(500).json({ 
      message: 'Error deleting company jobs',
      error: error.message 
    });
  }
};

// Delete company (Admin only)
exports.deleteCompany = async (req, res) => {
  try {
    const { slug } = req.params;
    const company = await Company.findOne({ where: { slug } });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Start a transaction to ensure data consistency
    const result = await sequelize.transaction(async (t) => {
      // First delete all job applications for this company's jobs
      await sequelize.query('DELETE FROM job_applications WHERE jobId IN (SELECT id FROM Jobs WHERE companyId = ?)', {
        replacements: [company.id],
        transaction: t
      });

      // Then delete all jobs associated with this company
      await Job.destroy({
        where: { companyId: company.id },
        transaction: t
      });

      // Finally delete the company
      await company.destroy({ transaction: t });
    });

    res.json({ message: 'Company, jobs, and applications deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ 
      message: 'Error deleting company',
      error: error.message 
    });
  }
}; 