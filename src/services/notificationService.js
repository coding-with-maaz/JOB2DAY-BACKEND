const admin = require('../config/firebase');
const { Job, User, Category } = require('../models');

class NotificationService {
  constructor() {
    this.isInitialized = admin.apps.length > 0;
  }

  /**
   * Send notification to multiple users
   */
  async sendMulticast(message) {
    if (!this.isInitialized) {
      console.warn('⚠️  Firebase not initialized, skipping notification');
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log(`✅ Notification sent to ${response.successCount} users`);
      
      if (response.failureCount > 0) {
        console.warn(`⚠️  ${response.failureCount} notifications failed`);
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`❌ Failed to send to token ${idx}:`, resp.error);
          }
        });
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error sending FCM notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to a single user
   */
  async sendToUser(userId, notification) {
    const user = await User.findByPk(userId);
    if (!user || !user.fcmToken) {
      console.warn(`⚠️  User ${userId} not found or no FCM token`);
      return false;
    }

    const message = {
      notification,
      token: user.fcmToken,
    };

    try {
      await admin.messaging().send(message);
      console.log(`✅ Notification sent to user ${userId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error sending to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send daily jobs notification
   */
  async sendDailyJobsNotification() {
    console.log('🕒 Starting daily jobs notification...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      // Get jobs posted today
      const jobs = await Job.findAll({
        where: {
          createdAt: {
            [require('sequelize').Op.gte]: today,
            [require('sequelize').Op.lt]: tomorrow
          },
          status: 'active'
        },
        include: [
          {
            model: Category,
            as: 'jobCategories',
            attributes: ['name'],
            through: { attributes: [] } // Exclude junction table attributes
          }
        ]
      });

      if (jobs.length === 0) {
        console.log('ℹ️  No new jobs today, skipping notification');
        return;
      }

      // Get users with FCM tokens
      const users = await User.findAll({
        where: {
          fcmToken: {
            [require('sequelize').Op.ne]: null
          },
          role: 'jobseeker' // Only send to job seekers
        },
        attributes: ['id', 'fcmToken', 'firstName']
      });

      if (users.length === 0) {
        console.log('ℹ️  No users with FCM tokens found');
        return;
      }

      // Group jobs by category
      const jobsByCategory = {};
      jobs.forEach(job => {
        if (job.jobCategories && job.jobCategories.length > 0) {
          job.jobCategories.forEach(category => {
            const categoryName = category.name || 'Other';
            jobsByCategory[categoryName] = (jobsByCategory[categoryName] || 0) + 1;
          });
        } else {
          // If no categories, group under 'Other'
          jobsByCategory['Other'] = (jobsByCategory['Other'] || 0) + 1;
        }
      });

      // Create category summary
      const categorySummary = Object.entries(jobsByCategory)
        .map(([category, count]) => `${count} ${category}`)
        .join(', ');

      const notification = {
        title: '🔥 New Jobs Available!',
        body: `${jobs.length} new jobs posted today: ${categorySummary}`,
      };

      const message = {
        notification,
        tokens: users.map(u => u.fcmToken),
        data: {
          type: 'daily_jobs',
          jobCount: jobs.length.toString(),
          categories: Object.keys(jobsByCategory).join(','),
          clickAction: 'OPEN_JOBS_LIST'
        }
      };

      const response = await this.sendMulticast(message);
      
      console.log(`📊 Daily notification summary:`);
      console.log(`   - Jobs posted today: ${jobs.length}`);
      console.log(`   - Users notified: ${response.successCount}`);
      console.log(`   - Failed deliveries: ${response.failureCount}`);
      
      return response;
    } catch (error) {
      console.error('❌ Error in daily jobs notification:', error);
      throw error;
    }
  }

  /**
   * Send category-specific notification
   */
  async sendCategoryNotification(categoryId, jobCount) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      console.warn(`⚠️  Category ${categoryId} not found`);
      return;
    }

    const users = await User.findAll({
      where: {
        fcmToken: {
          [require('sequelize').Op.ne]: null
        },
        role: 'jobseeker'
      }
    });

    if (users.length === 0) return;

    const notification = {
      title: `💼 New ${category.name} Jobs!`,
      body: `${jobCount} new ${category.name} jobs just posted.`,
    };

    const message = {
      notification,
      tokens: users.map(u => u.fcmToken),
      data: {
        type: 'category_jobs',
        categoryId: categoryId.toString(),
        categoryName: category.name,
        jobCount: jobCount.toString(),
        clickAction: 'OPEN_CATEGORY'
      }
    };

    return await this.sendMulticast(message);
  }

  /**
   * Send job application status notification
   */
  async sendApplicationStatusNotification(userId, jobTitle, status) {
    const statusMessages = {
      'reviewing': 'Your application is being reviewed',
      'shortlisted': 'Congratulations! You\'ve been shortlisted',
      'rejected': 'Application status update',
      'hired': 'Congratulations! You\'ve been hired!'
    };

    const notification = {
      title: `📋 Application Update: ${jobTitle}`,
      body: statusMessages[status] || 'Your application status has been updated',
    };

    return await this.sendToUser(userId, notification);
  }

  /**
   * Send welcome notification to new users
   */
  async sendWelcomeNotification(userId, firstName) {
    const notification = {
      title: '🎉 Welcome to HarPalJob!',
      body: `Hi ${firstName}! Start exploring thousands of job opportunities.`,
    };

    return await this.sendToUser(userId, notification);
  }

  /**
   * Test notification (for admin use)
   */
  async sendTestNotification(userId = null) {
    const notification = {
      title: '🧪 Test Notification',
      body: 'This is a test notification from HarPalJob!',
    };

    if (userId) {
      return await this.sendToUser(userId, notification);
    } else {
      // Send to all users with FCM tokens
      const users = await User.findAll({
        where: {
          fcmToken: {
            [require('sequelize').Op.ne]: null
          }
        },
        attributes: ['fcmToken']
      });

      if (users.length === 0) {
        console.log('ℹ️  No users with FCM tokens found');
        return;
      }

      const message = {
        notification,
        tokens: users.map(u => u.fcmToken),
        data: {
          type: 'test',
          clickAction: 'OPEN_APP'
        }
      };

      return await this.sendMulticast(message);
    }
  }

  /**
   * Clean up invalid FCM tokens
   */
  async cleanupInvalidTokens() {
    if (!this.isInitialized) return;

    const users = await User.findAll({
      where: {
        fcmToken: {
          [require('sequelize').Op.ne]: null
        }
      }
    });

    let cleanedCount = 0;
    for (const user of users) {
      try {
        // Try to send a silent message to test token validity
        await admin.messaging().send({
          token: user.fcmToken,
          data: { test: 'true' }
        });
      } catch (error) {
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
          // Remove invalid token
          await user.update({ fcmToken: null });
          cleanedCount++;
          console.log(`🧹 Removed invalid FCM token for user ${user.id}`);
        }
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} invalid FCM tokens`);
    }

    return cleanedCount;
  }
}

module.exports = new NotificationService(); 