const { Ad } = require('../models');

// Create a new ad (Admin only)
exports.createAd = async (req, res) => {
  try {
    const ad = await Ad.create(req.body);
    res.status(201).json(ad);
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ message: 'Error creating ad' });
  }
};

// Get all ads (Admin only)
exports.getAllAds = async (req, res) => {
  try {
    const ads = await Ad.findAll();
    res.json(ads);
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ message: 'Error fetching ads' });
  }
};

// Get ad by ID (Admin only)
exports.getAdById = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }
    res.json(ad);
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({ message: 'Error fetching ad' });
  }
};

// Update ad by ID (Admin only)
exports.updateAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }
    await ad.update(req.body);
    res.json(ad);
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ message: 'Error updating ad' });
  }
};

// Delete ad by ID (Admin only)
exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }
    await ad.destroy();
    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ message: 'Error deleting ad' });
  }
};

// Get active ads by location (Public)
exports.getActiveAdsByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const ads = await Ad.findAll({
      where: {
        location: location,
        isActive: true,
      },
    });
    res.json(ads);
  } catch (error) {
    console.error('Error fetching active ads by location:', error);
    res.status(500).json({ message: 'Error fetching active ads by location' });
  }
}; 