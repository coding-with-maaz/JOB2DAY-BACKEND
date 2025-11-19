const { JobApplication, Job, User } = require('../src/models');

async function seedJobApplications() {
  try {
    // Get some sample jobs and users
    const jobs = await Job.findAll({ limit: 5 });
    const users = await User.findAll({ 
      where: { role: 'user' },
      limit: 10 
    });

    if (!jobs.length || !users.length) {
      console.log('No jobs or users found for seeding applications');
      return;
    }

    const applications = [];

    // Create multiple applications for each job
    for (const job of jobs) {
      // Randomly select 2-4 users to apply for each job
      const numApplicants = Math.floor(Math.random() * 3) + 2;
      const selectedUsers = users.sort(() => 0.5 - Math.random()).slice(0, numApplicants);

      for (const user of selectedUsers) {
        applications.push({
          jobId: job.id,
          userId: user.id,
          resumeUrl: `https://harpaljob.com/resumes/${user.id}_resume.pdf`,
          coverLetter: `I am writing to express my interest in the ${job.title} position at ${job.companyName}. I believe my skills and experience make me a strong candidate for this role.`,
          status: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'][Math.floor(Math.random() * 5)],
          appliedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
          notes: Math.random() > 0.7 ? 'Promising candidate with relevant experience' : null
        });
      }
    }

    if (applications.length > 0) {
      await JobApplication.bulkCreate(applications);
      console.log(`Created ${applications.length} job applications`);
    } else {
      console.log('No applications were created');
    }
  } catch (error) {
    console.error('Error seeding job applications:', error);
    throw error;
  }
}

module.exports = seedJobApplications; 