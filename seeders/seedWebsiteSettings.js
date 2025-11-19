const { WebsiteSetting } = require('../src/models');

async function seedWebsiteSettings() {
  await WebsiteSetting.create({
    siteTitle: 'HarPalJob - Find Your Dream Job',
    siteDescription: 'Browse job opportunities and advance your career with HarPalJob.',
    siteKeywords: 'jobs, careers, employment, hiring',
    ogTitle: 'HarPalJob',
    ogDescription: 'Find your next job on HarpalJob.',
    ogImageUrl: 'https://example.com/harpaljob-og.png',
  });
}

module.exports = seedWebsiteSettings; 