const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdsConfig = sequelize.define('AdsConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  environment: {
    type: DataTypes.ENUM('test', 'production'),
    defaultValue: 'test',
    allowNull: false,
  },
  banner: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: true,
      adUnitId: '',
      position: 'bottom', // 'top', 'bottom'
      refreshInterval: 60 // seconds
    },
    allowNull: false,
  },
  interstitial: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: true,
      adUnitId: '',
      showOnJobView: true,
      showOnCategoryView: false,
      showOnCompanyView: false,
      showOnTemplateSelection: true,
      showOnPreviewDownload: true,
      showOnCountryJobsPage: true,
      minInterval: 300 // seconds between shows
    },
    allowNull: false,
  },
  rewarded: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: false,
      adUnitId: '',
      rewardType: 'premium_jobs', // 'premium_jobs', 'boost_profile', 'remove_ads'
      rewardAmount: 1
    },
    allowNull: false,
  },
  rewardedInterstitial: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: false,
      adUnitId: '',
      rewardType: 'premium_jobs', // 'premium_jobs', 'boost_profile', 'remove_ads'
      rewardAmount: 1
    },
    allowNull: false,
  },
  native: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: true,
      adUnitId: '',
      position: 'job_list', // 'job_list', 'company_list', 'category_list'
      style: 'default' // 'default', 'custom'
    },
    allowNull: false,
  },
  appOpen: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: true,
      adUnitId: '',
      androidAdUnitId: 'ca-app-pub-3940256099942544/9257395921', // Android app open test ad
      iosAdUnitId: 'ca-app-pub-3940256099942544/5575463023', // iOS app open test ad
      showOnResume: true,
      maxShowsPerDay: 3
    },
    allowNull: false,
  },
  splash: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: false,
      adUnitId: '',
      showDelay: 2, // seconds
      skipAfter: 5 // seconds
    },
    allowNull: false,
  },
  custom: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: false,
      adUnitId: '',
      position: 'custom',
      customConfig: {}
    },
    allowNull: false,
  },
  globalSettings: {
    type: DataTypes.JSON,
    defaultValue: {
      testMode: true,
      debugMode: false,
      userConsentRequired: true,
      ageRestriction: 13,
      maxAdsPerSession: 10,
      cooldownPeriod: 60 // seconds
    },
    allowNull: false,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['environment'] },
    { fields: ['updatedAt'] }
  ]
});

// Define associations
AdsConfig.associate = (models) => {
  // Define the association with User model
  AdsConfig.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'updatedByUser',
    targetKey: 'id'
  });
};

module.exports = AdsConfig; 