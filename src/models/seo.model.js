const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const SEO = sequelize.define('SEO', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('global', 'homepage', 'job-listing', 'companies', 'categories', 'about', 'contact'),
    allowNull: false
  },
  // Global SEO fields
  siteTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  siteDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  keywords: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  robotsTxt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sitemapEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  googleAnalyticsId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  googleVerification: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bingVerification: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Homepage SEO fields
  homepageTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  homepageDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ogTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ogDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ogImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Job Listing SEO fields
  jobTitleTemplate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  jobDescriptionTemplate: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ogTitleTemplate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ogDescriptionTemplate: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ogImageTemplate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Companies page SEO fields
  companiesTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companiesDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companiesOgTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companiesOgDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companiesOgImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Categories page SEO fields
  categoriesTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  categoriesDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoriesOgTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  categoriesOgDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoriesOgImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // About page SEO fields
  aboutTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  aboutDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  aboutOgTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  aboutOgDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  aboutOgImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Contact page SEO fields
  contactTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contactDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contactOgTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contactOgDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contactOgImage: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['type'] }
  ],
  hooks: {
    afterSync: async () => {
      // Check if we have any SEO settings
      const count = await SEO.count();
      if (count === 0) {
        // Create initial SEO settings
        await SEO.bulkCreate([
          {
            type: 'global',
            siteTitle: 'HarPalJob - Find Jobs Near You',
            siteDescription: 'Find your dream job near you. Browse thousands of job listings and connect with top employers.',
            keywords: 'jobs, employment, career, hiring, job search, local jobs',
            robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/',
            sitemapEnabled: true,
            googleAnalyticsId: 'UA-XXXXXXXXX-X'
          },
          {
            type: 'homepage',
            homepageTitle: 'Find Jobs Near You | HarPalJob',
            homepageDescription: 'Search and apply for jobs in your area. Browse through thousands of job listings from top employers.',
            ogTitle: 'Find Jobs Near You | HarPalJob',
            ogDescription: 'Search and apply for jobs in your area. Browse through thousands of job listings from top employers.',
            ogImage: 'https://harpaljob.com/og-image.jpg'
          },
          {
            type: 'job-listing',
            jobTitleTemplate: '{jobTitle} at {companyName} | HarPalJob',
            jobDescriptionTemplate: 'Apply for {jobTitle} at {companyName}. {jobDescription}',
            ogTitleTemplate: '{jobTitle} at {companyName} | HarPalJob',
            ogDescriptionTemplate: 'Apply for {jobTitle} at {companyName}. {jobDescription}',
            ogImageTemplate: '{companyLogo}'
          },
          {
            type: 'companies',
            companiesTitle: 'Top Companies Hiring | HarPalJob',
            companiesDescription: 'Discover top companies actively hiring on HarPalJob. Find your dream employer and explore current job opportunities.',
            companiesOgTitle: 'Top Companies Hiring | HarPalJob',
            companiesOgDescription: 'Discover top companies actively hiring on HarPalJob. Find your dream employer and explore current job opportunities.',
            companiesOgImage: 'https://harpaljob.com/og-image.jpg'
          },
          {
            type: 'categories',
            categoriesTitle: 'Browse Jobs by Category | HarPalJob',
            categoriesDescription: 'Explore job opportunities by category. Find the perfect job that matches your skills and interests.',
            categoriesOgTitle: 'Browse Jobs by Category | HarPalJob',
            categoriesOgDescription: 'Explore job opportunities by category. Find the perfect job that matches your skills and interests.',
            categoriesOgImage: 'https://harpaljob.com/og-image.jpg'
          },
          {
            type: 'about',
            aboutTitle: 'About HarPalJob | Your Job Search Partner',
            aboutDescription: 'Learn about HarPalJob\'s mission to connect job seekers with their dream opportunities. Discover our story and commitment to your career success.',
            aboutOgTitle: 'About HarPalJob | Your Job Search Partner',
            aboutOgDescription: 'Learn about HarPalJob\'s mission to connect job seekers with their dream opportunities. Discover our story and commitment to your career success.',
            aboutOgImage: 'https://harpaljob.com/og-image.jpg'
          },
          {
            type: 'contact',
            contactTitle: 'Contact HarPalJob | Get in Touch',
            contactDescription: 'Contact HarPalJob for support, partnerships, or inquiries. We\'re here to help you with your job search journey.',
            contactOgTitle: 'Contact HarPalJob | Get in Touch',
            contactOgDescription: 'Contact HarPalJob for support, partnerships, or inquiries. We\'re here to help you with your job search journey.',
            contactOgImage: 'https://harpaljob.com/og-image.jpg'
          }
        ]);
      }
    }
  }
});

module.exports = SEO; 