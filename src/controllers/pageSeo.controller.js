const { PageSeo } = require('../models');

exports.getPageSeo = async (req, res) => {
  try {
    const { pageName } = req.params;
    const pageSeo = await PageSeo.findOne({ where: { pageName } });
    
    if (!pageSeo) {
      return res.status(404).json({ message: 'Page SEO settings not found' });
    }
    
    res.json(pageSeo);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching page SEO settings', error: error.message });
  }
};

exports.updatePageSeo = async (req, res) => {
  try {
    const { pageName } = req.params;
    const pageSeo = await PageSeo.findOne({ where: { pageName } });
    
    if (!pageSeo) {
      return res.status(404).json({ message: 'Page SEO settings not found' });
    }
    
    await pageSeo.update(req.body);
    res.json(pageSeo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating page SEO settings', error: error.message });
  }
}; 