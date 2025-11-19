const cron = require('node-cron');
const notificationService = require('./notificationService');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize all scheduled jobs
   */
  init() {
    if (this.isInitialized) {
      console.log('⚠️  Scheduler already initialized');
      return;
    }

    console.log('🕒 Initializing notification scheduler...');

    // Daily jobs notification - runs at 10 AM every day
    this.scheduleDailyJobsNotification();

    // Weekly token cleanup - runs every Sunday at 2 AM
    this.scheduleTokenCleanup();

    // Weekend check - disable notifications on weekends
    this.scheduleWeekendCheck();

    this.isInitialized = true;
    console.log('✅ Notification scheduler initialized');
  }

  /**
   * Schedule daily jobs notification
   */
  scheduleDailyJobsNotification() {
    const job = cron.schedule('0 10 * * *', async () => {
      console.log('🕒 Running daily jobs notification...');
      
      // Skip on weekends (optional)
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        console.log('ℹ️  Skipping daily notification on weekend');
        return;
      }

      try {
        await notificationService.sendDailyJobsNotification();
      } catch (error) {
        console.error('❌ Error in daily jobs notification:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Karachi" // Pakistan timezone
    });

    this.jobs.set('dailyJobs', job);
    console.log('📅 Daily jobs notification scheduled for 10:00 AM daily');
  }

  /**
   * Schedule token cleanup
   */
  scheduleTokenCleanup() {
    const job = cron.schedule('0 2 * * 0', async () => {
      console.log('🧹 Running FCM token cleanup...');
      
      try {
        const cleanedCount = await notificationService.cleanupInvalidTokens();
        console.log(`✅ Token cleanup completed: ${cleanedCount} tokens removed`);
      } catch (error) {
        console.error('❌ Error in token cleanup:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Karachi"
    });

    this.jobs.set('tokenCleanup', job);
    console.log('📅 Token cleanup scheduled for 2:00 AM every Sunday');
  }

  /**
   * Schedule weekend check (optional)
   */
  scheduleWeekendCheck() {
    const job = cron.schedule('0 9 * * 1', async () => {
      console.log('📊 Weekly notification summary...');
      
      // You can add weekly analytics here
      // For example, send a summary to admins
    }, {
      scheduled: true,
      timezone: "Asia/Karachi"
    });

    this.jobs.set('weekendCheck', job);
    console.log('📅 Weekend check scheduled for 9:00 AM every Monday');
  }

  /**
   * Manually trigger daily jobs notification
   */
  async triggerDailyJobsNotification() {
    console.log('🚀 Manually triggering daily jobs notification...');
    try {
      const result = await notificationService.sendDailyJobsNotification();
      console.log('✅ Manual daily notification completed');
      return result;
    } catch (error) {
      console.error('❌ Error in manual daily notification:', error);
      throw error;
    }
  }

  /**
   * Manually trigger token cleanup
   */
  async triggerTokenCleanup() {
    console.log('🧹 Manually triggering token cleanup...');
    try {
      const result = await notificationService.cleanupInvalidTokens();
      console.log('✅ Manual token cleanup completed');
      return result;
    } catch (error) {
      console.error('❌ Error in manual token cleanup:', error);
      throw error;
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(userId = null) {
    console.log('🧪 Sending test notification...');
    try {
      const result = await notificationService.sendTestNotification(userId);
      console.log('✅ Test notification sent');
      return result;
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      throw error;
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    const status = {
      initialized: this.isInitialized,
      jobs: {}
    };

    for (const [name, job] of this.jobs) {
      try {
        status.jobs[name] = {
          running: job.running || false,
          nextDate: this.getNextRunTime(name),
          lastDate: null // node-cron doesn't provide last run time
        };
      } catch (error) {
        console.error(`Error getting status for job ${name}:`, error);
        status.jobs[name] = {
          running: false,
          nextDate: null,
          lastDate: null,
          error: error.message
        };
      }
    }

    return status;
  }

  /**
   * Get next run time for a specific job
   */
  getNextRunTime(jobName) {
    try {
      const now = new Date();
      const job = this.jobs.get(jobName);
      
      if (!job) return null;

      // Calculate next run time based on cron expression
      const cronExpressions = {
        'dailyJobs': '0 10 * * *',
        'tokenCleanup': '0 2 * * 0',
        'weekendCheck': '0 9 * * 1'
      };

      const expression = cronExpressions[jobName];
      if (!expression) return null;

      // Simple calculation for next run time
      const nextRun = this.calculateNextRunTime(expression, now);
      return nextRun.toISOString();
    } catch (error) {
      console.error(`Error calculating next run time for ${jobName}:`, error);
      return null;
    }
  }

  /**
   * Calculate next run time based on cron expression
   */
  calculateNextRunTime(expression, fromDate = new Date()) {
    const parts = expression.split(' ');
    const [minute, hour, day, month, dayOfWeek] = parts;

    const next = new Date(fromDate);
    next.setSeconds(0);
    next.setMilliseconds(0);

    // Set minute
    if (minute !== '*') {
      next.setMinutes(parseInt(minute));
    } else {
      next.setMinutes(0);
    }

    // Set hour
    if (hour !== '*') {
      next.setHours(parseInt(hour));
    } else {
      next.setHours(0);
    }

    // Set day of month
    if (day !== '*') {
      next.setDate(parseInt(day));
    }

    // Set month
    if (month !== '*') {
      next.setMonth(parseInt(month) - 1);
    }

    // Set day of week
    if (dayOfWeek !== '*') {
      const targetDay = parseInt(dayOfWeek);
      const currentDay = next.getDay();
      const daysToAdd = (targetDay - currentDay + 7) % 7;
      next.setDate(next.getDate() + daysToAdd);
    }

    // If the calculated time is in the past, move to next occurrence
    if (next <= fromDate) {
      if (expression === '0 10 * * *') {
        // Daily job - move to next day
        next.setDate(next.getDate() + 1);
      } else if (expression === '0 2 * * 0') {
        // Weekly job - move to next Sunday
        const daysUntilSunday = (7 - next.getDay()) % 7;
        next.setDate(next.getDate() + daysUntilSunday);
      } else if (expression === '0 9 * * 1') {
        // Weekly job - move to next Monday
        const daysUntilMonday = (8 - next.getDay()) % 7;
        next.setDate(next.getDate() + daysUntilMonday);
      }
    }

    return next;
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log('🛑 Stopping all scheduled jobs...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`⏹️  Stopped job: ${name}`);
    }

    this.isInitialized = false;
    console.log('✅ All scheduled jobs stopped');
  }

  /**
   * Restart all scheduled jobs
   */
  restart() {
    console.log('🔄 Restarting scheduler...');
    this.stop();
    this.init();
  }
}

module.exports = new SchedulerService(); 