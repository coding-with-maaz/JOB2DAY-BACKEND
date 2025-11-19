const { Analytics, User, Job, Company, Category } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// Track an analytics event
exports.trackEvent = async (req, res) => {
  try {
    const {
      eventType,
      eventName,
      pageUrl,
      referrer,
      metadata
    } = req.body;

    const analytics = await Analytics.create({
      eventType,
      eventName,
      userId: req.user?.id,
      pageUrl,
      referrer,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      metadata
    });

    res.status(201).json(analytics);
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({ message: 'Error tracking analytics event' });
  }
};

// Get analytics data (Admin only)
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, eventType } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (eventType) {
      where.eventType = eventType;
    }

    const analytics = await Analytics.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: 1000
    });

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
};

// Get analytics summary (Admin only)
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const summary = await Analytics.findAll({
      attributes: [
        'eventType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('DATE', sequelize.col('timestamp')), 'date']
      ],
      where,
      group: ['eventType', sequelize.fn('DATE', sequelize.col('timestamp'))],
      order: [[sequelize.fn('DATE', sequelize.col('timestamp')), 'DESC']]
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ message: 'Error fetching analytics summary' });
  }
};

// Get dashboard stats (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.count();
    
    // Get total jobs
    const totalJobs = await Job.count();
    
    // Get active jobs
    const activeJobs = await Job.count({
      where: { status: 'active' }
    });
    
    // Get total companies
    const totalCompanies = await Company.count();

    // Calculate growth percentages
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const newUsersLastMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonth
        }
      }
    });
    
    const newJobsLastMonth = await Job.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonth
        }
      }
    });
    
    const newCompaniesLastMonth = await Company.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonth
        }
      }
    });

    const userGrowth = totalUsers > 0 ? (newUsersLastMonth / totalUsers) * 100 : 0;
    const jobGrowth = totalJobs > 0 ? (newJobsLastMonth / totalJobs) * 100 : 0;
    const companyGrowth = totalCompanies > 0 ? (newCompaniesLastMonth / totalCompanies) * 100 : 0;

    // Get monthly stats for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Promise.all(
      Array.from({ length: 6 }, async (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const [users, jobs, revenue] = await Promise.all([
          User.count({
            where: {
              createdAt: {
                [Op.between]: [startOfMonth, endOfMonth]
              }
            }
          }),
          Job.count({
            where: {
              createdAt: {
                [Op.between]: [startOfMonth, endOfMonth]
              }
            }
          }),
          // Calculate revenue (you can modify this based on your revenue model)
          Job.sum('salary', {
            where: {
              createdAt: {
                [Op.between]: [startOfMonth, endOfMonth]
              }
            }
          }) || 0
        ]);

        return {
          month: month.toLocaleString('default', { month: 'short' }),
          users,
          jobs,
          revenue
        };
      })
    );

    const dashboardStats = {
      totalUsers,
      totalJobs,
      activeJobs,
      totalCompanies,
      userGrowth: Math.round(userGrowth * 100) / 100,
      jobGrowth: Math.round(jobGrowth * 100) / 100,
      companyGrowth: Math.round(companyGrowth * 100) / 100,
      monthlyStats: monthlyStats.reverse()
    };

    res.json(dashboardStats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

// Get job stats (Admin only)
exports.getJobStats = async (req, res) => {
  try {
    // Get active jobs count
    const activeJobs = await Job.count({
      where: { status: 'active' }
    });

    // Calculate job growth
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const newJobsLastMonth = await Job.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonth
        }
      }
    });

    const totalJobs = await Job.count();
    const jobGrowth = totalJobs > 0 ? (newJobsLastMonth / totalJobs) * 100 : 0;

    // Get job categories distribution
    const categories = await Category.findAll({
      attributes: [
        'name',
        [sequelize.literal('(SELECT COUNT(*) FROM job_categories WHERE job_categories.categoryId = Category.id)'), 'value']
      ],
      order: [[sequelize.literal('value'), 'DESC']],
      limit: 5
    });

    const jobStats = {
      activeJobs,
      jobGrowth: Math.round(jobGrowth * 100) / 100,
      categories: categories.map(cat => ({
        name: cat.name,
        value: parseInt(cat.getDataValue('value'))
      }))
    };

    res.json(jobStats);
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ message: 'Error fetching job stats' });
  }
};

// Get user stats (Admin only)
exports.getUserStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.count();

    // Calculate user growth
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const newUsersLastMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonth
        }
      }
    });

    const userGrowth = totalUsers > 0 ? (newUsersLastMonth / totalUsers) * 100 : 0;

    const userStats = {
      totalUsers,
      userGrowth: Math.round(userGrowth * 100) / 100
    };

    res.json(userStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
}; 