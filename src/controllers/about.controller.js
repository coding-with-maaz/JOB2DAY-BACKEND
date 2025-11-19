const { About } = require('../models');

// Get about page content
exports.getAboutContent = async (req, res) => {
  try {
    const about = await About.findOne({
      where: { status: 'active' }
    });

    if (!about) {
      return res.status(404).json({ message: 'About page content not found' });
    }

    // Ensure JSON fields are properly parsed
    const aboutData = about.toJSON();
    aboutData.stats = Array.isArray(aboutData.stats) ? aboutData.stats : [];
    aboutData.values = Array.isArray(aboutData.values) ? aboutData.values : [];
    aboutData.team = Array.isArray(aboutData.team) ? aboutData.team : [];

    res.json(aboutData);
  } catch (error) {
    console.error('Error fetching about content:', error);
    res.status(500).json({ message: 'Error fetching about content' });
  }
};

// Update about page content (Admin only)
exports.updateAboutContent = async (req, res) => {
  try {
    const {
      title,
      description,
      stats,
      story,
      mission,
      values,
      team,
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    // Ensure JSON fields are arrays
    const validatedStats = Array.isArray(stats) ? stats : [];
    const validatedValues = Array.isArray(values) ? values : [];
    const validatedTeam = Array.isArray(team) ? team : [];

    let about = await About.findOne({
      where: { status: 'active' }
    });

    if (!about) {
      // Create new about content if none exists
      about = await About.create({
        title,
        description,
        stats: validatedStats,
        story,
        mission,
        values: validatedValues,
        team: validatedTeam,
        seoTitle,
        seoDescription,
        seoKeywords
      });
    } else {
      // Update existing about content
      await about.update({
        title,
        description,
        stats: validatedStats,
        story,
        mission,
        values: validatedValues,
        team: validatedTeam,
        seoTitle,
        seoDescription,
        seoKeywords
      });
    }

    // Ensure JSON fields are properly parsed in response
    const aboutData = about.toJSON();
    aboutData.stats = Array.isArray(aboutData.stats) ? aboutData.stats : [];
    aboutData.values = Array.isArray(aboutData.values) ? aboutData.values : [];
    aboutData.team = Array.isArray(aboutData.team) ? aboutData.team : [];

    res.json(aboutData);
  } catch (error) {
    console.error('Error updating about content:', error);
    res.status(500).json({ message: 'Error updating about content' });
  }
};

// Get about page stats
exports.getAboutStats = async (req, res) => {
  try {
    const about = await About.findOne({
      where: { status: 'active' },
      attributes: ['stats']
    });

    if (!about) {
      return res.status(404).json({ message: 'About page stats not found' });
    }

    const stats = Array.isArray(about.stats) ? about.stats : [];
    res.json(stats);
  } catch (error) {
    console.error('Error fetching about stats:', error);
    res.status(500).json({ message: 'Error fetching about stats' });
  }
};

// Get about page team
exports.getAboutTeam = async (req, res) => {
  try {
    const about = await About.findOne({
      where: { status: 'active' },
      attributes: ['team']
    });

    if (!about) {
      return res.status(404).json({ message: 'About page team not found' });
    }

    const team = Array.isArray(about.team) ? about.team : [];
    res.json(team);
  } catch (error) {
    console.error('Error fetching about team:', error);
    res.status(500).json({ message: 'Error fetching about team' });
  }
}; 