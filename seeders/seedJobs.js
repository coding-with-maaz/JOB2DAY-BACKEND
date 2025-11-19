const { Job, User, Company, Category } = require('../src/models');
const slugify = require('../src/utils/slugify');

async function seedJobs() {
  try {
    // First, get the employer users and companies
    const harpalJobEmployer = await User.findOne({ where: { email: 'john.doe@example.com' } });
    const anotherCompanyEmployer = await User.findOne({ where: { email: 'jane.smith@example.com' } });
    
    const harpalJobCompany = await Company.findOne({ where: { name: 'HarpalJob' } });
    const dataSphereCompany = await Company.findOne({ where: { name: 'DataSphere Analytics' } });

    // Get some categories for job associations
    const categories = await Category.findAll({ limit: 3 });

    // Create jobs one by one to handle associations properly
    const jobs = [];
    
    // Job 1: Senior Node.js Developer
    const job1 = await Job.create({
      title: 'Senior Node.js Developer',
      slug: slugify('Senior Node.js Developer'),
      description: '<p>We are looking for a skilled Node.js Developer to join our team.</p>',
      location: 'Remote',
      salary: '$80,000 - $120,000 per year',
      jobType: 'full-time',
      experience: '5+ years',
      skills: 'Node.js, Express, Sequelize, MySQL',
      status: 'active',
      employerId: harpalJobEmployer.id,
      companyId: harpalJobCompany.id,
      imageUrl: 'https://example.com/nodejs-job.png',
      seoTitle: 'Node.js Developer Job',
      seoDescription: 'Apply for Senior Node.js Developer position.',
      applyLink: 'https://example.com/apply/nodejs',
      tags: 'Nodejs, Backend, API',
      country: 'USA',
      isFeatured: true,
      vacancy: 2,
      views: 150,
      position: 'Developer',
      qualification: 'Bachelor\'s Degree',
      industry: 'Software Development',
      applyBefore: new Date('2024-12-31'),
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    });
    await job1.setJobCategories(categories);
    jobs.push(job1);

    // Job 2: Frontend React Developer
    const job2 = await Job.create({
      title: 'Frontend React Developer',
      slug: slugify('Frontend React Developer'),
      description: '<p>Join our dynamic team building amazing user interfaces with React.</p>',
      location: 'New York, NY',
      salary: '$70,000 - $100,000 per year',
      jobType: 'full-time',
      experience: '3+ years',
      skills: 'React, JavaScript, HTML, CSS',
      status: 'active',
      employerId: harpalJobEmployer.id,
      companyId: harpalJobCompany.id,
      imageUrl: 'https://example.com/react-job.png',
      seoTitle: 'React Developer Job',
      seoDescription: 'Exciting opportunity for a React Developer.',
      applyLink: 'https://example.com/apply/react',
      tags: 'React, Frontend, UI',
      country: 'USA',
      isFeatured: false,
      vacancy: 1,
      views: 80,
      position: 'Developer',
      qualification: 'Bachelor\'s Degree',
      industry: 'Software Development',
      applyBefore: new Date('2024-11-15'),
      createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    });
    await job2.setJobCategories(categories);
    jobs.push(job2);

    // Job 3: Marketing Specialist
    const job3 = await Job.create({
      title: 'Marketing Specialist',
      slug: slugify('Marketing Specialist'),
      description: '<p>Help us spread the word about HarpalJob!</p>',
      location: 'Remote',
      salary: '$50,000 - $70,000 per year',
      jobType: 'full-time',
      experience: '2+ years',
      skills: 'Digital Marketing, Social Media, SEO',
      status: 'active',
      employerId: harpalJobEmployer.id,
      companyId: harpalJobCompany.id,
      imageUrl: 'https://example.com/marketing-job.png',
      seoTitle: 'Marketing Specialist Job',
      seoDescription: 'Join our marketing team.',
      applyLink: 'https://example.com/apply/marketing',
      tags: 'Marketing, SEO, Social Media',
      country: 'Canada',
      isFeatured: true,
      vacancy: 1,
      views: 200,
      position: 'Specialist',
      qualification: 'Bachelor\'s Degree',
      industry: 'Marketing and Advertising',
      applyBefore: new Date('2025-01-31'),
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
    });
    await job3.setJobCategories(categories);
    jobs.push(job3);

    // Job 4: Data Analyst
    const job4 = await Job.create({
      title: 'Data Analyst',
      slug: slugify('Data Analyst'),
      description: '<p>Analyze data to help us make informed decisions.</p>',
      location: 'London, UK',
      salary: '£40,000 - £55,000 per year',
      jobType: 'full-time',
      experience: '3+ years',
      skills: 'SQL, Python, R, Data Visualization',
      status: 'active',
      employerId: anotherCompanyEmployer.id,
      companyId: dataSphereCompany.id,
      imageUrl: 'https://example.com/data-job.png',
      seoTitle: 'Data Analyst Job',
      seoDescription: 'Analyze data with us.',
      applyLink: 'https://example.com/apply/data',
      tags: 'Data, Analytics, SQL',
      country: 'UK',
      isFeatured: false,
      vacancy: 1,
      views: 120,
      position: 'Analyst',
      qualification: 'Bachelor\'s or Master\'s Degree',
      industry: 'Technology',
      applyBefore: new Date('2024-10-01'),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    });
    await job4.setJobCategories(categories);
    jobs.push(job4);

    return jobs;
  } catch (error) {
    console.error('Error seeding jobs:', error);
    throw error;
  }
}

module.exports = seedJobs; 