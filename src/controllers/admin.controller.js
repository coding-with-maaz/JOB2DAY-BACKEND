const { User, Job } = require('../models');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalJobs = await Job.count();
    const activeJobs = await Job.count({ where: { status: 'active' } });
    res.json({ totalUsers, totalJobs, activeJobs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// GET /api/admin/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error });
  }
}; 