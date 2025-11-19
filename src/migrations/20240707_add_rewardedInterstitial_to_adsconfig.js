// Migration to add rewardedInterstitial column to AdsConfigs
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('AdsConfigs', 'rewardedInterstitial', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {
        enabled: false,
        adUnitId: '',
        rewardType: 'premium_jobs',
        rewardAmount: 1
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('AdsConfigs', 'rewardedInterstitial');
  }
}; 