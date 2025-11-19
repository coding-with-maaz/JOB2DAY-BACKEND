const { Company } = require('../src/models');
const slugify = require('../src/utils/slugify');

async function seedCompanies() {
  const companies = await Company.bulkCreate([
    {
      name: 'HarpalJob',
      slug: slugify('HarpalJob'),
      industry: 'Technology',
      size: '50-200',
      location: 'New York, NY',
      description: 'HarpalJob is a leading job portal platform connecting talented professionals with their dream jobs. We specialize in technology, marketing, and data science roles.',
      logo: 'https://example.com/harpaljob-logo.png',
      founded: 2010,
      rating: 4.5,
      featured: true,
      benefits: [
        'Health Insurance',
        'Remote Work',
        'Flexible Hours',
        'Professional Development',
        '401(k) Matching'
      ],
      website: 'https://harpaljob.com',
      email: 'contact@harpaljob.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      seoTitle: 'HarpalJob - Leading Job Portal',
      seoDescription: 'Find your dream job with HarpalJob, the leading job portal for technology, marketing, and data science professionals.',
      seoKeywords: 'job portal, tech jobs, marketing jobs, data science jobs',
      ogTitle: 'HarpalJob - Your Career Partner',
      ogDescription: 'Connect with top employers and find your next career opportunity.',
      ogImageUrl: 'https://example.com/harpaljob-og.png',
      canonicalUrl: 'https://harpaljob.com/companies/harpaljob',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'HarpalJob',
        'url': 'https://harpaljob.com',
        'logo': 'https://example.com/harpaljob-logo.png',
        'foundingDate': '2010'
      }
    },
    {
      name: 'TechInnovate Solutions',
      slug: slugify('TechInnovate Solutions'),
      industry: 'Technology',
      size: '200-500',
      location: 'San Francisco, CA',
      description: 'TechInnovate Solutions is a cutting-edge technology company specializing in software development and digital innovation. We build scalable solutions for businesses worldwide.',
      logo: 'https://example.com/techinnovate-logo.png',
      founded: 2015,
      rating: 4.8,
      featured: true,
      benefits: [
        'Competitive Salary',
        'Stock Options',
        'Remote Work',
        'Health & Wellness',
        'Learning Budget'
      ],
      website: 'https://techinnovate.com',
      email: 'info@techinnovate.com',
      phone: '+1 (555) 987-6543',
      status: 'active',
      seoTitle: 'TechInnovate Solutions - Software Development Company',
      seoDescription: 'Join TechInnovate Solutions, a leading software development company building innovative solutions for businesses worldwide.',
      seoKeywords: 'software development, tech company, digital innovation, IT solutions',
      ogTitle: 'TechInnovate Solutions - Innovation Leaders',
      ogDescription: 'Building the future of technology with innovative software solutions.',
      ogImageUrl: 'https://example.com/techinnovate-og.png',
      canonicalUrl: 'https://harpaljob.com/companies/techinnovate-solutions',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'TechInnovate Solutions',
        'url': 'https://techinnovate.com',
        'logo': 'https://example.com/techinnovate-logo.png',
        'foundingDate': '2015'
      }
    },
    {
      name: 'DataSphere Analytics',
      slug: slugify('DataSphere Analytics'),
      industry: 'Data Science',
      size: '50-200',
      location: 'London, UK',
      description: 'DataSphere Analytics is a leading data science and analytics company helping businesses make data-driven decisions through advanced analytics and machine learning.',
      logo: 'https://example.com/datasphere-logo.png',
      founded: 2018,
      rating: 4.6,
      featured: true,
      benefits: [
        'Health Insurance',
        'Remote Work',
        'Data Science Training',
        'Conference Attendance',
        'Flexible Hours'
      ],
      website: 'https://datasphere.com',
      email: 'contact@datasphere.com',
      phone: '+44 20 1234 5678',
      status: 'active',
      seoTitle: 'DataSphere Analytics - Data Science Experts',
      seoDescription: 'Join DataSphere Analytics, a leading data science company helping businesses make data-driven decisions.',
      seoKeywords: 'data science, analytics, machine learning, business intelligence',
      ogTitle: 'DataSphere Analytics - Data Science Leaders',
      ogDescription: 'Transforming businesses through data science and analytics.',
      ogImageUrl: 'https://example.com/datasphere-og.png',
      canonicalUrl: 'https://harpaljob.com/companies/datasphere-analytics',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'DataSphere Analytics',
        'url': 'https://datasphere.com',
        'logo': 'https://example.com/datasphere-logo.png',
        'foundingDate': '2018'
      }
    }
  ]);

  return companies;
}

module.exports = seedCompanies; 