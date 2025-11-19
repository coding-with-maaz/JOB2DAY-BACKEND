const { Job, User, Category, Company, JobApplication } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('../utils/slugify');
const emailService = require('../services/emailService');

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'newest',
      search,
      q,
      location,
      jobType,
      experience,
      minSalary,
      maxSalary,
      featured,
      date
    } = req.query;

    // Build where clause
    const where = { status: 'active' };
    
    // Use either 'search' or 'q' parameter
    const searchTerm = search || q;
    if (searchTerm) {
      where[Op.or] = [
        { title: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } }
      ];
    }
    
    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }
    
    if (jobType) {
      where.jobType = jobType.toLowerCase().replace('-', ' ');
    }
    
    if (experience) {
      where.experience = { [Op.like]: `%${experience}%` };
    }
    
    if (minSalary || maxSalary) {
      where.salary = {};
      if (minSalary) {
        where.salary[Op.gte] = parseInt(minSalary);
      }
      if (maxSalary) {
        where.salary[Op.lte] = parseInt(maxSalary);
      }
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Date filtering
    if (date) {
      try {
        const filterDate = new Date(date);
        const nextDay = new Date(filterDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        where.createdAt = {
          [Op.gte]: filterDate,
          [Op.lt]: nextDay
        };
      } catch (error) {
        console.error('Invalid date format:', date);
        return res.status(400).json({
          message: 'Invalid date format. Use YYYY-MM-DD format.'
        });
      }
    }

    // Build order clause
    let order = [];
    switch (sort) {
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'salary-high':
        order = [['salary', 'DESC']];
        break;
      case 'salary-low':
        order = [['salary', 'ASC']];
        break;
      case 'relevance':
        if (searchTerm) {
          order = [
            [sequelize.literal(`CASE WHEN title LIKE '%${searchTerm}%' THEN 1 ELSE 0 END`), 'DESC'],
            ['createdAt', 'DESC']
          ];
        } else {
          order = [['createdAt', 'DESC']];
        }
        break;
      default: // 'newest'
        order = [['createdAt', 'DESC']];
    }

    // Define includes for related data
    const include = [
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
    ];

    // Get total count
    const totalCount = await Job.count({
      where,
      include: searchTerm ? [
        {
          model: User,
          as: 'postedJobs',
          attributes: ['companyName']
        },
        {
          model: Company,
          as: 'company',
          attributes: ['name']
        }
      ] : []
    });

    // Get paginated results
    const jobs = await Job.findAll({
      where,
      include,
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // If there's a search term, filter by company name after fetching
    let filteredJobs = jobs;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredJobs = jobs.filter(job => {
        const companyMatch = job.postedJobs?.companyName?.toLowerCase().includes(searchLower);
        const titleMatch = job.title.toLowerCase().includes(searchLower);
        const descriptionMatch = job.description.toLowerCase().includes(searchLower);
        return companyMatch || titleMatch || descriptionMatch;
      });
    }

    const result = {
      jobs: filteredJobs,
      total: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit))
    };

    // Add caching headers for better performance (shorter cache for dynamic data)
    res.set({
      'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      'ETag': `"jobs-${page}-${limit}-${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
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
        }
      ]
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Increment views count
    job.views = job.views + 1;
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error fetching job' });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      where: { status: 'active' },
      include: [
        {
          model: User,
          as: 'postedJobs',
          attributes: ['id', 'firstName', 'lastName', 'email', 'logoUrl', 'companySince', 'companyName']
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
          attributes: ['id', 'name', 'slug', 'industry', 'size', 'location', 'description']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        message: 'Job not found'
      });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    res.status(500).json({
      message: 'Error fetching job',
      error: error.message
    });
  }
};

// Get job by Slug (Public route)
exports.getJobBySlug = async (req, res) => {
  try {
    const job = await Job.findOne({
      where: { slug: req.params.slug },
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
          attributes: ['id', 'name', 'slug', 'industry', 'size', 'location', 'description']
        }
      ]
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Increment views count for public view
    job.views = job.views + 1;
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Error fetching job by slug:', error);
    res.status(500).json({ message: 'Error fetching job by slug' });
  }
};

// Create new job (Admin only)
exports.createJob = async (req, res) => {
  try {
    console.log('Received job creation request:', req.body);
    const {
      title,
      description,
      location,
      salary,
      jobType,
      experience,
      skills,
      status,
      imageUrl,
      seoTitle,
      seoDescription,
      applyLink,
      tags,
      country,
      isFeatured,
      vacancy,
      views,
      position,
      qualification,
      industry,
      applyBefore,
      categoryIds,
      companyId
    } = req.body;

    const employerId = req.user.id;

    // Validate required fields
    if (!title || !description || !location || !companyId) {
      console.log('Missing required fields:', { title, description, location, companyId });
      return res.status(400).json({
        message: 'Please provide all required fields: title, description, location, and company'
      });
    }

    // Find the company to get its name
    const company = await Company.findByPk(companyId);
    if (!company) {
      console.log('Company not found:', companyId);
      return res.status(400).json({
        message: 'Selected company not found'
      });
    }

    // Generate a unique slug
    const slug = slugify(title);

    // First create the job
    const job = await Job.create({
      title,
      slug,
      description,
      location,
      salary,
      jobType,
      experience,
      skills,
      status,
      employerId,
      companyId,
      imageUrl,
      seoTitle,
      seoDescription,
      applyLink,
      tags,
      country,
      isFeatured,
      vacancy,
      position,
      qualification,
      industry,
      applyBefore
    });

    // Then associate categories if provided
    if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      const categories = await Category.findAll({
        where: {
          id: categoryIds
        }
      });
      
      if (categories.length > 0) {
        await job.setJobCategories(categories);
      }
    }

    // Fetch the complete job with all associations for the response
    const createdJob = await Job.findOne({
      where: { id: job.id },
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
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    res.status(201).json(createdJob);
  } catch (error) {
    console.error('Error creating job:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ 
        message: 'A job with this title already exists. Please try a different title.',
        error: error.errors[0].message
      });
    } else {
      res.status(500).json({ 
        message: 'Error creating job',
        error: error.message
      });
    }
  }
};

// Update job by Slug (Admin only)
exports.updateJobBySlug = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      salary,
      jobType,
      experience,
      skills,
      status,
      imageUrl,
      seoTitle,
      seoDescription,
      applyLink,
      tags,
      country,
      isFeatured,
      vacancy,
      views,
      position,
      qualification,
      industry,
      applyBefore,
      categoryIds,
      companyId
    } = req.body;

    const jobSlug = req.params.slug;
    const employerId = req.user.id;

    console.log('Updating job with slug:', jobSlug);
    console.log('Employer ID:', employerId);

    // Find the job by slug
    const job = await Job.findOne({
      where: { slug: jobSlug },
      include: [
        {
          model: Category,
          as: 'jobCategories',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ]
    });

    if (!job) {
      console.log('Job not found with slug:', jobSlug);
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is authorized to update the job
    if (job.employerId !== employerId && req.user.role !== 'admin') {
      console.log('Unauthorized update attempt. Job employerId:', job.employerId, 'User employerId:', employerId);
      return res.status(403).json({ message: 'You are not authorized to update this job' });
    }

    // Validate company if companyId is provided
    if (companyId) {
      const company = await Company.findByPk(companyId);
      if (!company) {
        return res.status(400).json({ message: 'Selected company not found' });
      }
    }

    // Update job fields
    const updateFields = {
      title,
      description,
      location,
      salary,
      jobType,
      experience,
      skills,
      status,
      imageUrl,
      seoTitle,
      seoDescription,
      applyLink,
      tags,
      country,
      isFeatured,
      vacancy,
      views,
      position,
      qualification,
      industry,
      applyBefore,
      companyId
    };

    // Only update fields that are provided
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        job[key] = updateFields[key];
      }
    });

    // If title is being updated, generate a new slug
    if (title && title !== job.title) {
      job.slug = slugify(title);
    }

    await job.save();

    // Update categories if provided
    if (categoryIds !== undefined) {
      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        const categories = await Category.findAll({
          where: {
            id: categoryIds
          }
        });
        await job.setJobCategories(categories);
      } else if (Array.isArray(categoryIds) && categoryIds.length === 0) {
        // If categoryIds is an empty array, remove all categories
        await job.setJobCategories([]);
      }
    }

    // Fetch the updated job with associations for the response
    const updatedJob = await Job.findOne({
      where: { id: job.id },
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
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Error updating job' });
  }
};

// Delete job by Slug (Admin only)
exports.deleteJobBySlug = async (req, res) => {
  try {
    const jobSlug = req.params.slug;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the job by slug
    const job = await Job.findOne({
      where: { slug: jobSlug }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is admin or the job creator
    if (userRole !== 'admin' && job.employerId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this job' });
    }

    // Start a transaction to ensure data consistency
    const result = await sequelize.transaction(async (t) => {
      // Delete associated job applications first
      await sequelize.query('DELETE FROM job_applications WHERE jobId = ?', {
        replacements: [job.id],
        transaction: t
      });

      // Then delete the job
      await job.destroy({ transaction: t });
    });

    res.json({ message: 'Job and associated applications deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      res.status(500).json({ 
        message: 'Failed to delete job. Please try again or contact support if the issue persists.',
        error: 'Database constraint error'
      });
    } else {
      res.status(500).json({ message: 'Error deleting job' });
    }
  }
};

// Get featured jobs
exports.getFeaturedJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { isFeatured: true, status: 'active' },
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
        }
      ]
    });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching featured jobs:', error);
    res.status(500).json({ message: 'Error fetching featured jobs' });
  }
};

// Get jobs by Category ID
exports.getJobsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const jobs = await Job.findAll({
      where: { status: 'active' },
      include: [
        {
          model: User,
          as: 'postedJobs',
          attributes: ['id', 'firstName', 'lastName', 'logoUrl', 'companySince', 'companyName']
        },
        {
          model: Category,
          as: 'jobCategories',
          required: true,
          where: { id: categoryId },
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!jobs || jobs.length === 0) {
      return res.json([]);
    }

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs by category:', error);
    res.status(500).json({ message: 'Error fetching jobs by category' });
  }
};

// Get all countries with job counts (optimized with caching)
exports.getAllCountries = async (req, res) => {
  try {
    const countries = await Job.findAll({
      attributes: [
        'country',
        [sequelize.fn('COUNT', sequelize.col('id')), 'jobCount']
      ],
      where: {
        status: 'active',
        country: {
          [Op.not]: null
        }
      },
      group: ['country'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    const result = {
      countries: countries.map(country => ({
        name: country.country,
        jobCount: parseInt(country.getDataValue('jobCount')),
        slug: slugify(country.country)
      }))
    };

    // Add caching headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
      'ETag': `"countries-${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ message: 'Error fetching countries' });
  }
};

// Get jobs by country with detailed information
exports.getJobsByCountry = async (req, res) => {
  try {
    let { country } = req.params;
    
    // Remove any timestamp or slug suffix from the country parameter
    country = country.split('-')[0].toUpperCase();
    
    const {
      page = 1,
      limit = 10,
      sort = 'newest',
      jobType,
      experience,
      minSalary,
      maxSalary
    } = req.query;

    // Build where clause
    const where = {
      status: 'active',
      country: {
        [Op.or]: [
          { [Op.eq]: country }, // Exact match
          { [Op.eq]: country.toUpperCase() }, // Uppercase match
          { [Op.like]: `%${country}%` } // Partial match as fallback
        ]
      }
    };

    // Add additional filters if provided
    if (jobType) {
      where.jobType = jobType.toLowerCase().replace('-', ' ');
    }

    if (experience) {
      where.experience = { [Op.like]: `%${experience}%` };
    }

    if (minSalary || maxSalary) {
      where.salary = {};
      if (minSalary) {
        where.salary[Op.gte] = parseInt(minSalary);
      }
      if (maxSalary) {
        where.salary[Op.lte] = parseInt(maxSalary);
      }
    }

    // Build order clause
    let order = [];
    switch (sort) {
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'salary-high':
        order = [['salary', 'DESC']];
        break;
      case 'salary-low':
        order = [['salary', 'ASC']];
        break;
      default: // 'newest'
        order = [['createdAt', 'DESC']];
    }

    // Get total count
    const totalCount = await Job.count({ where });

    // Get jobs with related data
    const jobs = await Job.findAll({
      where,
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
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // Get country statistics
    const countryStats = await Job.findAll({
      attributes: [
        'jobType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        status: 'active',
        country: {
          [Op.or]: [
            { [Op.eq]: country },
            { [Op.eq]: country.toUpperCase() },
            { [Op.like]: `%${country}%` }
          ]
        }
      },
      group: ['jobType']
    });

    // Get all available countries for this search
    const availableCountries = await Job.findAll({
      attributes: [
        'country',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        status: 'active',
        country: {
          [Op.not]: null
        }
      },
      group: ['country'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    res.json({
      country: country,
      jobs: jobs,
      total: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      statistics: {
        totalJobs: totalCount,
        jobTypes: countryStats.map(stat => ({
          type: stat.jobType,
          count: parseInt(stat.getDataValue('count'))
        }))
      },
      availableCountries: availableCountries.map(c => ({
        name: c.country,
        count: parseInt(c.getDataValue('count')),
        slug: slugify(c.country)
      }))
    });
  } catch (error) {
    console.error('Error fetching jobs by country:', error);
    res.status(500).json({ message: 'Error fetching jobs by country' });
  }
};

// Get jobs by Company Name
exports.getJobsByCompanyName = async (req, res) => {
  try {
    const companyName = req.params.companyName;
    const jobs = await Job.findAll({
      where: { status: 'active' },
      include: [
        {
          model: User,
          as: 'postedJobs',
          where: { companyName: companyName },
          attributes: ['id', 'firstName', 'lastName', 'logoUrl', 'companySince', 'companyName']
        },
        {
          model: Category,
          as: 'jobCategories',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        }
      ]
    });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs by company name:', error);
    res.status(500).json({ message: 'Error fetching jobs by company name' });
  }
};

// Get total number of jobs
exports.getTotalJobs = async (req, res) => {
  try {
    const count = await Job.count();
    res.json({ totalJobs: count });
  } catch (error) {
    console.error('Error fetching total jobs:', error);
    res.status(500).json({ message: 'Error fetching total jobs' });
  }
};

// Get total number of categories
exports.getTotalCategories = async (req, res) => {
  try {
    const count = await Category.count();
    res.json({ totalCategories: count });
  } catch (error) {
    console.error('Error fetching total categories:', error);
    res.status(500).json({ message: 'Error fetching total categories' });
  }
};

// Get jobs posted in the last 24 hours (optimized)
exports.getTodayJobs = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Optimized query with better indexing and selective fields
    const jobs = await Job.findAll({
      where: {
        status: 'active', // Use indexed field first
        createdAt: {
          [Op.gte]: twentyFourHoursAgo
        }
      },
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
        }
      ],
      order: [['createdAt', 'DESC']], // Sort by newest first
      limit: 50 // Limit results for better performance
    });

    // Add caching headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'ETag': `"today-jobs-${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching today\'s jobs:', error);
    res.status(500).json({ message: 'Error fetching today\'s jobs' });
  }
};

// Quick apply for job (without authentication)
exports.quickApply = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, coverLetter, resumeUrl } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !coverLetter) {
      return res.status(400).json({
        message: 'Missing required fields: firstName, lastName, email, phone, coverLetter are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Check if job exists
    const job = await Job.findByPk(id, {
      where: { status: 'active' },
      attributes: ['id', 'title', 'slug', 'description', 'location', 'salary', 'jobType', 'experience', 'skills', 'status', 'employerId', 'companyId', 'imageUrl', 'tags', 'country', 'isFeatured', 'vacancy', 'views', 'position', 'qualification', 'industry', 'applyBefore', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'postedJobs',
          attributes: ['id', 'firstName', 'lastName', 'email', 'logoUrl', 'companySince', 'companyName']
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'slug', 'industry', 'size', 'location', 'description']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        message: 'Job not found or not active'
      });
    }

    // Check if this email has already applied for this specific job
    const existingApplication = await JobApplication.findOne({
      where: {
        jobId: id
      },
      include: [
        {
          model: User,
          as: 'applicationUser',
          where: {
            email: email
          },
          attributes: ['email']
        }
      ]
    });

    if (existingApplication) {
      return res.status(400).json({
        duplicate: true,
        message: 'You have already applied for this job with this email address'
      });
    }

    // For quick apply, we need to create a temporary user or find existing user by email
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Create a temporary user for quick apply
      user = await User.create({
        firstName,
        lastName,
        email,
        password: 'temp_password_' + Date.now(), // Temporary password
        role: 'user',
        phoneNumber: phone,
        isActive: true
      });
    }

    // Check if user already applied (this is redundant since we already checked by email above)
    // The email check above already prevents duplicates for quick apply

    // Create application (resumeUrl is required, so we'll use a placeholder if not provided)
    const application = await JobApplication.create({
      jobId: id,
      userId: user.id,
      coverLetter,
      resumeUrl: resumeUrl || 'https://example.com/placeholder-resume.pdf',
      status: 'pending',
      appliedAt: new Date()
    });

    console.log(`✅ Quick application submitted for job ${id} by ${email}`);

    // Send email notifications
    try {
      const applicationData = {
        job: job,
        applicant: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phoneNumber
        },
        application: application
      };

      // Send notification to employer
      const emailResult = await emailService.sendJobApplicationEmail(applicationData);
      if (emailResult.success) {
        console.log('✅ Job application email sent to employer');
      } else {
        console.warn('⚠️ Failed to send job application email:', emailResult.error);
      }

      // Send confirmation to applicant
      const confirmationResult = await emailService.sendApplicationConfirmationEmail(applicationData);
      if (confirmationResult.success) {
        console.log('✅ Application confirmation email sent to applicant');
      } else {
        console.warn('⚠️ Failed to send confirmation email:', confirmationResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending emails:', emailError);
      // Don't fail the application if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        jobId: application.jobId,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });
  } catch (error) {
    console.error('Error in quick apply:', error);
    res.status(500).json({
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// Apply for job (with authentication)
exports.applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetter, resumeUrl } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!coverLetter) {
      return res.status(400).json({
        message: 'Cover letter is required'
      });
    }

    // Check if job exists
    const job = await Job.findByPk(id, {
      where: { status: 'active' },
      include: [
        {
          model: User,
          as: 'postedJobs',
          attributes: ['id', 'firstName', 'lastName', 'email', 'logoUrl', 'companySince', 'companyName']
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'slug', 'industry', 'size', 'location', 'description']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        message: 'Job not found or not active'
      });
    }

    // Get user details for email
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if user already applied
    const existingApplication = await JobApplication.findOne({
      where: {
        jobId: id,
        userId: userId
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        message: 'You have already applied for this job'
      });
    }

    // Create job application
    const application = await JobApplication.create({
      jobId: id,
      userId: userId,
      coverLetter,
      resumeUrl: resumeUrl || null,
      status: 'pending',
      appliedAt: new Date()
    });

    console.log(`✅ Application submitted for job ${id} by user ${userId}`);

    // Send email notifications
    try {
      const applicationData = {
        job: job,
        applicant: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phoneNumber
        },
        application: application
      };

      // Send notification to employer
      const emailResult = await emailService.sendJobApplicationEmail(applicationData);
      if (emailResult.success) {
        console.log('✅ Job application email sent to employer');
      } else {
        console.warn('⚠️ Failed to send job application email:', emailResult.error);
      }

      // Send confirmation to applicant
      const confirmationResult = await emailService.sendApplicationConfirmationEmail(applicationData);
      if (confirmationResult.success) {
        console.log('✅ Application confirmation email sent to applicant');
      } else {
        console.warn('⚠️ Failed to send confirmation email:', confirmationResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending emails:', emailError);
      // Don't fail the application if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        jobId: application.jobId,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });
  } catch (error) {
    console.error('Error in apply for job:', error);
    res.status(500).json({
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// Test email functionality (admin only)
exports.testEmail = async (req, res) => {
  try {
    const result = await emailService.testEmail();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
}; 