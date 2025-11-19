const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorizeRole } = require('../middleware');

// Admin only route to get all users
router.get('/', authenticateToken, authorizeRole(['admin']), userController.getAllUsers);

// Authenticated user route to get their own profile or Admin to get any user by ID
router.get('/:id', authenticateToken, userController.getUserById);

// Authenticated user route to update their own profile or Admin to update any user by ID
router.put('/:id', authenticateToken, userController.updateUser);

// Admin only route to delete a user
router.delete('/:id', authenticateToken, authorizeRole(['admin']), userController.deleteUser);

module.exports = router; 