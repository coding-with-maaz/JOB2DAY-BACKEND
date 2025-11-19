const { Ad } = require('../src/models');

async function seedAds() {
  const ads = await Ad.bulkCreate([
    {
      name: 'Homepage Banner',
      adCode: '<div class="ad-banner">Terra Ads Banner</div>',
      location: 'homepage',
      isActive: true,
      adNetwork: 'Terra Ads',
      dimensions: '728x90',
      adType: 'display'
    },
    {
      name: 'Job Sidebar',
      adCode: '<div class="ad-sidebar">Terra Ads Sidebar</div>',
      location: 'job_sidebar',
      isActive: true,
      adNetwork: 'Terra Ads',
      dimensions: '300x250',
      adType: 'display'
    },
    {
      name: 'Category Header',
      adCode: '<div class="ad-header">Terra Ads Header</div>',
      location: 'category_header',
      isActive: true,
      adNetwork: 'Terra Ads',
      dimensions: '970x90',
      adType: 'display'
    }
  ]);

  return ads;
}

module.exports = seedAds; 