const { AdsConfig, User } = require('../models');
const { ValidationError } = require('sequelize');

// Get current ads config (public endpoint)
exports.getConfig = async (req, res) => {
  try {
    let config = await AdsConfig.findOne({
      where: { environment: req.query.environment || 'production' }
    });
    if (!config) {
      config = await AdsConfig.create({
        environment: req.query.environment || 'production'
      });
    }
    const publicConfig = {
      environment: config.environment,
      banner: config.banner,
      interstitial: config.interstitial,
      rewarded: config.rewarded,
      // Include rewardedInterstitial in public response
      rewardedInterstitial: config.rewardedInterstitial,
      native: config.native,
      appOpen: config.appOpen,
      splash: config.splash,
      custom: config.custom,
      globalSettings: {
        testMode: config.globalSettings.testMode,
        debugMode: config.globalSettings.debugMode,
        userConsentRequired: config.globalSettings.userConsentRequired,
        ageRestriction: config.globalSettings.ageRestriction,
        maxAdsPerSession: config.globalSettings.maxAdsPerSession,
        cooldownPeriod: config.globalSettings.cooldownPeriod
      },
      updatedAt: config.updatedAt
    };
    res.json(publicConfig);
  } catch (error) {
    console.error('Error fetching ads config:', error);
    res.status(500).json({ message: 'Failed to fetch ads configuration' });
  }
};

// Get all configs (admin endpoint)
exports.getAllConfigs = async (req, res) => {
  try {
    const configs = await AdsConfig.findAll({
      include: [{
        model: User,
        as: 'updatedByUser',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['updatedAt', 'DESC']]
    });
    res.json(configs);
  } catch (error) {
    console.error('Error fetching all ads configs:', error);
    res.status(500).json({ message: 'Failed to fetch ads configurations' });
  }
};

// Update ads config (admin endpoint)
exports.updateConfig = async (req, res) => {
  try {
    const { environment = 'production', ...updateData } = req.body;
    if (!['test', 'production'].includes(environment)) {
      return res.status(400).json({ message: 'Environment must be either "test" or "production"' });
    }
    let config = await AdsConfig.findOne({ where: { environment } });
    if (!config) {
      config = await AdsConfig.create({
        environment,
        ...updateData,
        updatedBy: req.user.id
      });
    } else {
      await config.update({
        ...updateData,
        updatedBy: req.user.id
      });
    }
    const updatedConfig = await AdsConfig.findByPk(config.id, {
      include: [{
        model: User,
        as: 'updatedByUser',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating ads config:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: 'Validation Error',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
          value: e.value
        }))
      });
    }
    res.status(500).json({ message: 'Failed to update ads configuration' });
  }
};

// Delete ads config (admin endpoint)
exports.deleteConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await AdsConfig.findByPk(id);
    if (!config) {
      return res.status(404).json({ message: 'Ads configuration not found' });
    }
    await config.destroy();
    res.json({ message: 'Ads configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting ads config:', error);
    res.status(500).json({ message: 'Failed to delete ads configuration' });
  }
};

// Reset config to defaults (admin endpoint)
exports.resetConfig = async (req, res) => {
  try {
    const { environment = 'production' } = req.body;
    let config = await AdsConfig.findOne({ where: { environment } });
    const defaults = {
      banner: {
        enabled: true,
        adUnitId: '',
        position: 'bottom',
        refreshInterval: 60
      },
      interstitial: {
        enabled: true,
        adUnitId: '',
        showOnJobView: true,
        showOnCategoryView: false,
        showOnCompanyView: false,
        minInterval: 300
      },
      rewarded: {
        enabled: false,
        adUnitId: '',
        rewardType: 'premium_jobs',
        rewardAmount: 1
      },
      // Add rewardedInterstitial defaults
      rewardedInterstitial: {
        enabled: false,
        adUnitId: '',
        rewardType: 'premium_jobs',
        rewardAmount: 1,
        minInterval: 300,
        maxShowsPerSession: 5
      },
      native: {
        enabled: true,
        adUnitId: '',
        position: 'job_list',
        style: 'default'
      },
      appOpen: {
        enabled: true,
        adUnitId: '',
        showOnResume: true,
        maxShowsPerDay: 3
      },
      splash: {
        enabled: false,
        adUnitId: '',
        showDelay: 2,
        skipAfter: 5
      },
      custom: {
        enabled: false,
        adUnitId: '',
        position: 'custom',
        customConfig: {}
      },
      globalSettings: {
        testMode: true,
        debugMode: false,
        userConsentRequired: true,
        ageRestriction: 13,
        maxAdsPerSession: 10,
        cooldownPeriod: 60
      },
      updatedBy: req.user.id
    };
    if (config) {
      await config.update(defaults);
    } else {
      config = await AdsConfig.create({ environment, ...defaults });
    }
    res.json(config);
  } catch (error) {
    console.error('Error resetting ads config:', error);
    res.status(500).json({ message: 'Failed to reset ads configuration' });
  }
};

// Get config by environment (admin endpoint)
exports.getConfigByEnvironment = async (req, res) => {
  try {
    const { environment } = req.params;
    if (!['test', 'production'].includes(environment)) {
      return res.status(400).json({ message: 'Environment must be either "test" or "production"' });
    }
    const config = await AdsConfig.findOne({
      where: { environment },
      include: [{
        model: User,
        as: 'updatedByUser',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    if (!config) {
      return res.status(404).json({ message: 'Ads configuration not found for this environment' });
    }
    res.json(config);
  } catch (error) {
    console.error('Error fetching ads config by environment:', error);
    res.status(500).json({ message: 'Failed to fetch ads configuration' });
  }
}; 