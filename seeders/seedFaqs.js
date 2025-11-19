const { FAQ } = require('../src/models');

async function seedFaqs() {
  await FAQ.bulkCreate([
    {
      question: 'How do I post a job?',
      answer: 'Simply create an account, go to your dashboard, and click "Post New Job". Fill in the details and publish your listing.',
      isActive: true
    },
    {
      question: 'Is it free to search for jobs?',
      answer: 'Yes! Job searching and applying is completely free for job seekers. We only charge employers for posting jobs.',
      isActive: true
    },
    {
      question: 'How do I contact employers?',
      answer: 'You can apply directly through our platform or use the contact information provided in the job listing.',
      isActive: true
    },
    {
      question: 'Can I edit my profile?',
      answer: 'Absolutely! Go to your profile page to update your information, skills, and preferences at any time.',
      isActive: true
    }
  ]);
}

module.exports = seedFaqs; 