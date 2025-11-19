const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// GET /api/admin/dashboard
router.get('/dashboard', adminController.getDashboard);

// GET /api/admin/users
router.get('/users', adminController.getUsers);

// GET /api/admin/jobs
router.get('/jobs', adminController.getJobs);

module.exports = router; 