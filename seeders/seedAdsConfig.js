const { AdsConfig, User } = require('../src/models');

async function seedAdsConfig() {
  try {
    console.log('🌱 Seeding Ads Configuration...');

    // Find admin user for updatedBy field
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    const updatedBy = adminUser ? adminUser.id : null;

    // Test environment configuration
    const testConfig = await AdsConfig.findOrCreate({
      where: { environment: 'test' },
      defaults: {
        environment: 'test',
        banner: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/6300978111', // Test banner ad unit ID
          position: 'bottom',
          refreshInterval: 60
        },
        interstitial: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/1033173712', // Test interstitial ad unit ID
          showOnJobView: true,
          showOnCategoryView: false,
          showOnCompanyView: false,
          minInterval: 300
        },
        rewarded: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/5224354917', // Test rewarded ad unit ID
          rewardType: 'premium_jobs',
          rewardAmount: 1
        },
        rewardedInterstitial: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/5354046379', // Test rewarded interstitial ad unit ID
          rewardType: 'premium_jobs',
          rewardAmount: 1
        },
        native: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/2247696110', // Test native ad unit ID
          position: 'job_list',
          style: 'default'
        },
        appOpen: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/9257395921', // Test app open ad unit ID (Android)
          androidAdUnitId: 'ca-app-pub-3940256099942544/9257395921', // Test Android app open ad unit ID
          iosAdUnitId: 'ca-app-pub-3940256099942544/5575463023', // Test iOS app open ad unit ID
          showOnResume: true,
          maxShowsPerDay: 3
        },
        splash: {
          enabled: false,
          adUnitId: 'ca-app-pub-3940256099942544/3419835294', // Test splash ad unit ID
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
          debugMode: true,
          userConsentRequired: true,
          ageRestriction: 13,
          maxAdsPerSession: 10,
          cooldownPeriod: 60
        },
        updatedBy
      }
    });

    // Production environment configuration
    const productionConfig = await AdsConfig.findOrCreate({
      where: { environment: 'production' },
      defaults: {
        environment: 'production',
        banner: {
          enabled: true,
          adUnitId: 'ca-app-pub-2809929499941883/1234567890', // Replace with your production banner ad unit ID
          position: 'bottom',
          refreshInterval: 60
        },
        interstitial: {
          enabled: true,
          adUnitId: 'ca-app-pub-2809929499941883/0987654321', // Replace with your production interstitial ad unit ID
          showOnJobView: true,
          showOnCategoryView: false,
          showOnCompanyView: false,
          minInterval: 300
        },
        rewarded: {
          enabled: false,
          adUnitId: 'ca-app-pub-2809929499941883/1122334455', // Replace with your production rewarded ad unit ID
          rewardType: 'premium_jobs',
          rewardAmount: 1
        },
        rewardedInterstitial: {
          enabled: false,
          adUnitId: 'ca-app-pub-2809929499941883/REPLACE_WITH_PRODUCTION_REWARDED_INTERSTITIAL', // Replace with your production rewarded interstitial ad unit ID
          rewardType: 'premium_jobs',
          rewardAmount: 1
        },
        native: {
          enabled: true,
          adUnitId: 'ca-app-pub-2809929499941883/5566778899', // Replace with your production native ad unit ID
          position: 'job_list',
          style: 'default'
        },
        appOpen: {
          enabled: true,
          adUnitId: 'ca-app-pub-2809929499941883/9988776655', // Replace with your production app open ad unit ID
          androidAdUnitId: 'ca-app-pub-2809929499941883/9988776655', // Replace with your production Android app open ad unit ID
          iosAdUnitId: 'ca-app-pub-2809929499941883/9988776655', // Replace with your production iOS app open ad unit ID
          showOnResume: true,
          maxShowsPerDay: 3
        },
        splash: {
          enabled: false,
          adUnitId: 'ca-app-pub-2809929499941883/4433221100', // Replace with your production splash ad unit ID
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
          testMode: false,
          debugMode: false,
          userConsentRequired: true,
          ageRestriction: 13,
          maxAdsPerSession: 10,
          cooldownPeriod: 60
        },
        updatedBy
      }
    });

    console.log('✅ Ads Configuration seeded successfully!');
    console.log(`   - Test environment: ${testConfig[0].environment}`);
    console.log(`   - Production environment: ${productionConfig[0].environment}`);

    return { testConfig: testConfig[0], productionConfig: productionConfig[0] };
  } catch (error) {
    console.error('❌ Error seeding Ads Configuration:', error);
    throw error;
  }
}

module.exports = seedAdsConfig; 