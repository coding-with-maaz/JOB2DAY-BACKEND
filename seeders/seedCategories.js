const { Category } = require('../src/models');
const slugify = require('../src/utils/slugify');

async function seedCategories() {
  const categories = await Category.bulkCreate([
    { 
      name: 'Technology', 
      slug: slugify('Technology'),
      description: 'Explore technology jobs in software development, IT, and digital innovation.',
      isActive: true,
      seoTitle: 'Technology Jobs - Find Tech Careers',
      seoDescription: 'Browse technology jobs in software development, IT, and digital innovation. Find your next tech career opportunity.',
      seoKeywords: 'technology jobs, tech careers, software development, IT jobs',
      ogTitle: 'Technology Jobs - HarpalJob',
      ogDescription: 'Find the best technology jobs and advance your tech career.',
      ogImageUrl: 'https://example.com/og/tech-jobs.jpg',
      canonicalUrl: 'https://harpaljob.com/categories/technology',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': []
      }
    },
    { 
      name: 'Development', 
      slug: slugify('Development'),
      description: 'Software development jobs for web, mobile, and enterprise applications.',
      isActive: true,
      seoTitle: 'Development Jobs - Software Development Careers',
      seoDescription: 'Find software development jobs in web, mobile, and enterprise applications. Start your development career today.',
      seoKeywords: 'development jobs, software development, web development, mobile development',
      ogTitle: 'Development Jobs - HarpalJob',
      ogDescription: 'Explore software development careers and find your next opportunity.',
      ogImageUrl: 'https://example.com/og/dev-jobs.jpg',
      canonicalUrl: 'https://harpaljob.com/categories/development',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': []
      }
    },
    { 
      name: 'Marketing', 
      slug: slugify('Marketing'),
      description: 'Marketing and advertising jobs for digital and traditional marketing.',
      isActive: true,
      seoTitle: 'Marketing Jobs - Digital & Traditional Marketing Careers',
      seoDescription: 'Discover marketing and advertising jobs in digital and traditional marketing. Find your perfect marketing role.',
      seoKeywords: 'marketing jobs, digital marketing, advertising careers, marketing careers',
      ogTitle: 'Marketing Jobs - HarpalJob',
      ogDescription: 'Find marketing and advertising jobs to advance your career.',
      ogImageUrl: 'https://example.com/og/marketing-jobs.jpg',
      canonicalUrl: 'https://harpaljob.com/categories/marketing',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': []
      }
    },
    { 
      name: 'Data Science', 
      slug: slugify('Data Science'),
      description: 'Data science and analytics jobs for big data and machine learning.',
      isActive: true,
      seoTitle: 'Data Science Jobs - Analytics & Machine Learning Careers',
      seoDescription: 'Explore data science and analytics jobs in big data and machine learning. Find your next data science role.',
      seoKeywords: 'data science jobs, analytics careers, machine learning jobs, big data careers',
      ogTitle: 'Data Science Jobs - HarpalJob',
      ogDescription: 'Find data science and analytics jobs to advance your career.',
      ogImageUrl: 'https://example.com/og/data-science-jobs.jpg',
      canonicalUrl: 'https://harpaljob.com/categories/data-science',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': []
      }
    },
    { 
      name: 'Analytics', 
      slug: slugify('Analytics'),
      description: 'Business analytics and data analysis jobs for insights and reporting.',
      isActive: true,
      seoTitle: 'Analytics Jobs - Business Intelligence & Data Analysis',
      seoDescription: 'Find business analytics and data analysis jobs. Start your career in business intelligence and reporting.',
      seoKeywords: 'analytics jobs, business intelligence, data analysis, reporting careers',
      ogTitle: 'Analytics Jobs - HarpalJob',
      ogDescription: 'Explore analytics and business intelligence jobs.',
      ogImageUrl: 'https://example.com/og/analytics-jobs.jpg',
      canonicalUrl: 'https://harpaljob.com/categories/analytics',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': []
      }
    }
  ]);

  return categories;
}

module.exports = seedCategories; 