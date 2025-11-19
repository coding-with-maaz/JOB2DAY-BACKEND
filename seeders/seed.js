const seedAdmin = require('./seedAdmin');
const seedUsers = require('./seedUsers');
const seedCategories = require('./seedCategories');
const seedCompanies = require('./seedCompanies');
const seedJobs = require('./seedJobs');
const seedJobApplications = require('./seedJobApplications');
const seedFaqs = require('./seedFaqs');
const seedWebsiteSettings = require('./seedWebsiteSettings');
const seedAds = require('./seedAds');
const seedAdsConfig = require('./seedAdsConfig');
const seedPageSeo = require('./seedPageSeo');
const seedAboutPage = require('./seedAboutPage');
const seedContactInfo = require('./seedContactInfo');

const models = require('../src/models');
const { 
  User, 
  Category, 
  Company, 
  Job, 
  JobApplication, 
  FAQ, 
  WebsiteSetting, 
  Ad,
  AdsConfig,
  SEO,
  About,
  ContactInfo
} = models;

// Verify all required models exist
const requiredModels = {
  User,
  Category,
  Company,
  Job,
  JobApplication,
  FAQ,
  WebsiteSetting,
  Ad,
  AdsConfig,
  SEO,
  About,
  ContactInfo
};

Object.entries(requiredModels).forEach(([name, model]) => {
  if (!model) {
    throw new Error(`Required model ${name} is undefined. Please check your models import.`);
  }
});

async function seedAll(force = false) {
  try {
    console.log('🌱 Starting database seeding...');

    // Ensure schema is up-to-date (creates missing join tables like job_categories)
    await models.sequelize.sync({ alter: false });

    // Check for existing data
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (existingAdmin && !force) {
      console.log('⚠️ Admin user already exists. Use force=true to overwrite.');
      return;
    }

    if (force) {
      console.log('🗑️ Cleaning up existing data...');
      // Delete in reverse order of dependencies
      await JobApplication.destroy({ where: {} });
      await Job.destroy({ where: {} });
      await Company.destroy({ where: {} });
      await Category.destroy({ where: {} });
      await User.destroy({ where: {} });
      await FAQ.destroy({ where: {} });
      await WebsiteSetting.destroy({ where: {} });
      await Ad.destroy({ where: {} });
      await AdsConfig.destroy({ where: {} });
      await SEO.destroy({ where: {} });
      await About.destroy({ where: {} });
      await ContactInfo.destroy({ where: {} });
      console.log('✅ Existing data cleaned up');
    }

    // Seed admin and users
    console.log('👤 Seeding admin and users...');
    await seedAdmin();
    await seedUsers();
    console.log('✅ Users seeded successfully');

    // Seed categories
    console.log('📑 Seeding categories...');
    await seedCategories();
    console.log('✅ Categories seeded successfully');

    // Seed companies
    console.log('🏢 Seeding companies...');
    await seedCompanies();
    console.log('✅ Companies seeded successfully');

    // Seed jobs
    console.log('💼 Seeding jobs...');
    await seedJobs();
    console.log('✅ Jobs seeded successfully');

    // Seed job applications
    console.log('📝 Seeding job applications...');
    await seedJobApplications();
    console.log('✅ Job applications seeded successfully');

    // Seed FAQs
    console.log('❓ Seeding FAQs...');
    await seedFaqs();
    console.log('✅ FAQs seeded successfully');

    // Seed website settings
    console.log('⚙️ Seeding website settings...');
    await seedWebsiteSettings();
    console.log('✅ Website settings seeded successfully');

    // Seed ads
    console.log('📢 Seeding ads...');
    await seedAds();
    console.log('✅ Ads seeded successfully');

    // Seed ads configuration
    console.log('⚙️ Seeding ads configuration...');
    await seedAdsConfig();
    console.log('✅ Ads configuration seeded successfully');

    // Seed page SEO
    console.log('🔍 Seeding page SEO...');
    await seedPageSeo();
    console.log('✅ Page SEO seeded successfully');

    // Seed about page
    console.log('📄 Seeding about page...');
    await seedAboutPage();
    console.log('✅ About page seeded successfully');

    // Seed contact info
    console.log('📞 Seeding contact info...');
    await seedContactInfo();
    console.log('✅ Contact info seeded successfully');

    console.log('🎉 All data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// If this file is run directly, seed with force=true
if (require.main === module) {
  seedAll(true)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAll; 