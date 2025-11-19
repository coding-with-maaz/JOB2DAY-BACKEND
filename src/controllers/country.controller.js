// Get all countries with their jobs
exports.getCountriesWithJobs = async (req, res) => {
  try {
    const countries = await Country.findAll({
      include: [
        {
          model: Job,
          as: 'jobs',
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: User,
              as: 'postedJobs',
              attributes: ['id', 'firstName', 'lastName', 'logoUrl', 'companySince', 'companyName']
            },
            {
              model: Category,
              as: 'jobCategories',
              attributes: ['id', 'name', 'slug'],
              through: { attributes: [] }
            },
            {
              model: Company,
              as: 'company',
              attributes: ['id', 'name', 'slug', 'industry']
            }
          ]
        }
      ],
      order: [
        ['name', 'ASC'],
        [{ model: Job, as: 'jobs' }, 'createdAt', 'DESC']
      ]
    });

    // Format the response
    const formattedCountries = countries.map(country => ({
      id: country.id,
      name: country.name,
      code: country.code,
      jobs: country.jobs.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        salary: job.salary,
        location: job.location,
        jobType: job.jobType,
        experience: job.experience,
        status: job.status,
        isFeatured: job.isFeatured,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        company: job.company,
        postedBy: job.postedJobs,
        categories: job.jobCategories
      }))
    }));

    res.json(formattedCountries);
  } catch (error) {
    console.error('Error fetching countries with jobs:', error);
    res.status(500).json({ message: 'Error fetching countries with jobs' });
  }
};

// Get jobs by country
exports.getJobsByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const country = await Country.findByPk(countryId, {
      include: [
        {
          model: Job,
          as: 'jobs',
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: User,
              as: 'postedJobs',
              attributes: ['id', 'firstName', 'lastName', 'logoUrl', 'companySince', 'companyName']
            },
            {
              model: Category,
              as: 'jobCategories',
              attributes: ['id', 'name', 'slug'],
              through: { attributes: [] }
            },
            {
              model: Company,
              as: 'company',
              attributes: ['id', 'name', 'slug', 'industry']
            }
          ],
          limit: parseInt(limit),
          offset: (parseInt(page) - 1) * parseInt(limit),
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    // Get total count of jobs for this country
    const totalCount = await Job.count({
      where: { 
        countryId,
        status: 'active'
      }
    });

    // Format the response
    const formattedCountry = {
      id: country.id,
      name: country.name,
      code: country.code,
      jobs: country.jobs.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        salary: job.salary,
        location: job.location,
        jobType: job.jobType,
        experience: job.experience,
        status: job.status,
        isFeatured: job.isFeatured,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        company: job.company,
        postedBy: job.postedJobs,
        categories: job.jobCategories
      })),
      pagination: {
        total: totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    };

    res.json(formattedCountry);
  } catch (error) {
    console.error('Error fetching jobs by country:', error);
    res.status(500).json({ message: 'Error fetching jobs by country' });
  }
}; 