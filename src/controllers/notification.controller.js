const notificationService = require('../services/notificationService');
const schedulerService = require('../services/schedulerService');
const { User } = require('../models');

// Save FCM token for a user
exports.saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({ 
        message: 'FCM token is required' 
      });
    }

    // Update user's FCM token
    await User.update(
      { fcmToken },
      { where: { id: userId } }
    );

    console.log(`✅ FCM token saved for user ${userId}`);

    res.json({ 
      success: true, 
      message: 'FCM token saved successfully' 
    });
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
    res.status(500).json({ 
      message: 'Failed to save FCM token' 
    });
  }
};

// Remove FCM token for a user (logout)
exports.removeFcmToken = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.update(
      { fcmToken: null },
      { where: { id: userId } }
    );

    console.log(`✅ FCM token removed for user ${userId}`);

    res.json({ 
      success: true, 
      message: 'FCM token removed successfully' 
    });
  } catch (error) {
    console.error('❌ Error removing FCM token:', error);
    res.status(500).json({ 
      message: 'Failed to remove FCM token' 
    });
  }
};

// Send test notification (admin only)
exports.sendTestNotification = async (req, res) => {
  try {
    const { userId } = req.body;

    const result = await schedulerService.sendTestNotification(userId);

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      result
    });
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    res.status(500).json({ 
      message: 'Failed to send test notification' 
    });
  }
};

// Manually trigger daily jobs notification (admin only)
exports.triggerDailyNotification = async (req, res) => {
  try {
    const result = await schedulerService.triggerDailyJobsNotification();

    res.json({
      success: true,
      message: 'Daily notification triggered successfully',
      result
    });
  } catch (error) {
    console.error('❌ Error triggering daily notification:', error);
    res.status(500).json({ 
      message: 'Failed to trigger daily notification' 
    });
  }
};

// Manually trigger token cleanup (admin only)
exports.triggerTokenCleanup = async (req, res) => {
  try {
    const result = await schedulerService.triggerTokenCleanup();

    res.json({
      success: true,
      message: 'Token cleanup triggered successfully',
      result
    });
  } catch (error) {
    console.error('❌ Error triggering token cleanup:', error);
    res.status(500).json({ 
      message: 'Failed to trigger token cleanup' 
    });
  }
};

// Get scheduler status (admin only)
exports.getSchedulerStatus = async (req, res) => {
  try {
    const status = schedulerService.getStatus();

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('❌ Error getting scheduler status:', error);
    res.status(500).json({ 
      message: 'Failed to get scheduler status' 
    });
  }
};

// Restart scheduler (admin only)
exports.restartScheduler = async (req, res) => {
  try {
    schedulerService.restart();

    res.json({
      success: true,
      message: 'Scheduler restarted successfully'
    });
  } catch (error) {
    console.error('❌ Error restarting scheduler:', error);
    res.status(500).json({ 
      message: 'Failed to restart scheduler' 
    });
  }
};

// Get notification statistics (admin only)
exports.getNotificationStats = async (req, res) => {
  try {
    // Get users with FCM tokens
    const usersWithTokens = await User.count({
      where: {
        fcmToken: {
          [require('sequelize').Op.ne]: null
        }
      }
    });

    // Get total users
    const totalUsers = await User.count();

    // Get users by role
    const jobSeekers = await User.count({
      where: { role: 'jobseeker' }
    });

    const employers = await User.count({
      where: { role: 'employer' }
    });

    const admins = await User.count({
      where: { role: 'admin' }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        usersWithFcmTokens: usersWithTokens,
        fcmTokenPercentage: totalUsers > 0 ? Math.round((usersWithTokens / totalUsers) * 100) : 0,
        byRole: {
          jobSeekers,
          employers,
          admins
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting notification stats:', error);
    res.status(500).json({ 
      message: 'Failed to get notification statistics' 
    });
  }
};

// Send welcome notification to new user
exports.sendWelcomeNotification = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const result = await notificationService.sendWelcomeNotification(
      userId, 
      user.firstName
    );

    res.json({
      success: true,
      message: 'Welcome notification sent successfully',
      result
    });
  } catch (error) {
    console.error('❌ Error sending welcome notification:', error);
    res.status(500).json({ 
      message: 'Failed to send welcome notification' 
    });
  }
};

// Send application status notification
exports.sendApplicationStatusNotification = async (req, res) => {
  try {
    const { userId, jobTitle, status } = req.body;

    if (!userId || !jobTitle || !status) {
      return res.status(400).json({ 
        message: 'User ID, job title, and status are required' 
      });
    }

    const result = await notificationService.sendApplicationStatusNotification(
      userId,
      jobTitle,
      status
    );

    res.json({
      success: true,
      message: 'Application status notification sent successfully',
      result
    });
  } catch (error) {
    console.error('❌ Error sending application status notification:', error);
    res.status(500).json({ 
      message: 'Failed to send application status notification' 
    });
  }
}; 