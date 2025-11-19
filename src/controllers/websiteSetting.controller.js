const { WebsiteSetting } = require('../models');
const fs = require('fs');
const path = require('path');

// Helper function to get the single website settings entry
const getWebsiteSettingsEntry = async () => {
  let settings = await WebsiteSetting.findOne();
  if (!settings) {
    // If no settings exist, create a default one
    settings = await WebsiteSetting.create({});
  }
  return settings;
};

// Get website settings (Public)
exports.getWebsiteSettings = async (req, res) => {
  try {
    const settings = await getWebsiteSettingsEntry();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching website settings:', error);
    res.status(500).json({ message: 'Error fetching website settings' });
  }
};

// Update website settings (Admin only)
exports.updateWebsiteSettings = async (req, res) => {
  try {
    const settings = await getWebsiteSettingsEntry();
    
    // Update fields from request body, excluding file fields
    const updateData = { ...req.body };
    delete updateData.favicon; // Prevent updating file fields via this route
    delete updateData.logo;

    await settings.update(updateData);
    res.json(settings);
  } catch (error) {
    console.error('Error updating website settings:', error);
    res.status(500).json({ message: 'Error updating website settings' });
  }
};

// Upload favicon (Admin only)
exports.uploadFavicon = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const settings = await getWebsiteSettingsEntry();

    // Delete old favicon if it exists
    if (settings.favicon) {
      const oldFaviconPath = path.join(__dirname, '../public/uploads', path.basename(settings.favicon));
      fs.unlink(oldFaviconPath, (err) => {
        if (err) console.error('Error deleting old favicon:', err);
      });
    }

    // Update favicon field with the new file path
    // Store a path relative to the public directory
    settings.favicon = '/uploads/' + req.file.filename; 
    await settings.save();

    res.json({ message: 'Favicon uploaded successfully', favicon: settings.favicon });
  } catch (error) {
    console.error('Error uploading favicon:', error);
    res.status(500).json({ message: 'Error uploading favicon' });
  }
};

// Upload logo (Admin only)
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const settings = await getWebsiteSettingsEntry();

    // Delete old logo if it exists
    if (settings.logo) {
       const oldLogoPath = path.join(__dirname, '../public/uploads', path.basename(settings.logo));
       fs.unlink(oldLogoPath, (err) => {
        if (err) console.error('Error deleting old logo:', err);
      });
    }

    // Update logo field with the new file path
     // Store a path relative to the public directory
    settings.logo = '/uploads/' + req.file.filename;
    await settings.save();

    res.json({ message: 'Logo uploaded successfully', logo: settings.logo });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ message: 'Error uploading logo' });
  }
}; 