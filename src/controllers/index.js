const authController = require('./auth.controller');
const userController = require('./user.controller');
const jobController = require('./job.controller');
const websiteSettingController = require('./websiteSetting.controller');
const sitemapController = require('./sitemap.controller');
const categoryController = require('./category.controller');
const pageSeoController = require('./pageSeo.controller');
const adController = require('./ad.controller');

module.exports = {
  authController,
  userController,
  jobController,
  websiteSettingController,
  sitemapController,
  categoryController,
  pageSeoController,
  adController,
  getFeaturedJobs: jobController.getFeaturedJobs,
  getJobsByCategory: jobController.getJobsByCategory,
  getJobsByCountry: jobController.getJobsByCountry,
  getJobsByCompanyName: jobController.getJobsByCompanyName,
  getTotalJobs: jobController.getTotalJobs,
  getTotalCategories: jobController.getTotalCategories,
  getTodayJobs: jobController.getTodayJobs,
  getAllCategoriesWithJobCount: categoryController.getAllCategoriesWithJobCount,
  getCategoryBySlug: categoryController.getCategoryBySlug,
  updateCategoryBySlug: categoryController.updateCategoryBySlug,
  deleteCategoryBySlug: categoryController.deleteCategoryBySlug,
  getJobBySlug: jobController.getJobBySlug,
  updateJobBySlug: jobController.updateJobBySlug,
  deleteJobBySlug: jobController.deleteJobBySlug,
  getPageSeo: pageSeoController.getPageSeo,
  updatePageSeo: pageSeoController.updatePageSeo,
  getWebsiteSettings: websiteSettingController.getWebsiteSettings,
  updateWebsiteSettings: websiteSettingController.updateWebsiteSettings,
  uploadFavicon: websiteSettingController.uploadFavicon,
  uploadLogo: websiteSettingController.uploadLogo,
  createAd: adController.createAd,
  getAllAds: adController.getAllAds,
  getAdById: adController.getAdById,
  updateAd: adController.updateAd,
  deleteAd: adController.deleteAd,
  getActiveAdsByLocation: adController.getActiveAdsByLocation,
}; 