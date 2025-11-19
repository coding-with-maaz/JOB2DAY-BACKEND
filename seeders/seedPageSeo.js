const { SEO } = require('../src/models');

async function seedPageSeo() {
  const seoData = [
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
  ];

  await SEO.bulkCreate(seoData);
}

module.exports = seedPageSeo; 