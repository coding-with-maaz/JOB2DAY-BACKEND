const express = require('express');
const router = express.Router();
const websiteSettingController = require('../controllers/websiteSetting.controller');
const { authenticateToken, authorizeRole } = require('../middleware');
const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where uploaded files will be stored
    cb(null, './public/uploads/'); // Create this directory if it doesn't exist
  },
  filename: (req, file, cb) => {
    // Use the original file name with a timestamp to avoid conflicts
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Create the multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// Public route to get website settings
router.get('/', websiteSettingController.getWebsiteSettings);

// Admin only route to update website settings (for text fields)
router.put('/', authenticateToken, authorizeRole(['admin']), websiteSettingController.updateWebsiteSettings);

// Admin only route to upload favicon (requires authentication and admin role)
router.post('/upload/favicon', authenticateToken, authorizeRole(['admin']), upload.single('favicon'), websiteSettingController.uploadFavicon);

// Admin only route to upload logo (requires authentication and admin role)
router.post('/upload/logo', authenticateToken, authorizeRole(['admin']), upload.single('logo'), websiteSettingController.uploadLogo);

module.exports = router; 