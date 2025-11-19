const { About } = require('../src/models');

async function seedAboutPage() {
  await About.create({
    title: 'About HarPalJob',
    description: 'We\'re on a mission to revolutionize how people find their dream jobs and how companies discover exceptional talent.',
    stats: [
      { icon: 'Users', label: 'Job Seekers', value: '50,000+' },
      { icon: 'Building', label: 'Companies', value: '3,200+' },
      { icon: 'Globe', label: 'Countries', value: '25+' },
      { icon: 'Award', label: 'Success Rate', value: '94%' }
    ],
    story: `Founded in 2020, HarPalJob was born from a simple observation: the job search process was broken. 
    Job seekers struggled to find relevant opportunities, while employers had difficulty connecting with the right talent.
    
    Our founders, having experienced these challenges firsthand in their careers at leading tech companies, 
    decided to build a platform that would bridge this gap using cutting-edge technology and human-centered design.
    
    Today, we're proud to serve thousands of job seekers and companies worldwide, facilitating meaningful 
    connections that drive career growth and business success.`,
    mission: 'To democratize access to career opportunities and help every professional reach their full potential while enabling companies to build exceptional teams.',
    values: [
      { name: 'Transparency', description: 'Open and honest communication' },
      { name: 'Innovation', description: 'Continuous improvement and growth' },
      { name: 'Inclusion', description: 'Equal opportunities for everyone' },
      { name: 'Excellence', description: 'Delivering exceptional experiences' }
    ],
    team: [
      {
        name: 'Sarah Johnson',
        role: 'CEO & Founder',
        image: 'https://example.com/team/sarah.jpg',
        bio: 'Former VP at LinkedIn with 15+ years in recruitment technology.'
      },
      {
        name: 'Michael Chen',
        role: 'CTO',
        image: 'https://example.com/team/michael.jpg',
        bio: 'Former Google engineer passionate about connecting talent with opportunities.'
      },
      {
        name: 'Emily Rodriguez',
        role: 'Head of Operations',
        image: 'https://example.com/team/emily.jpg',
        bio: 'Expert in scaling recruitment operations and customer success.'
      }
    ],
    seoTitle: 'About HarPalJob - Your Career Partner',
    seoDescription: 'Learn about HarPalJob\'s mission to connect talented professionals with their dream jobs. Discover our story, values, and the team behind our success.',
    seoKeywords: 'about HarPalJob, job platform, career partner, recruitment technology, job search platform',
    status: 'active'
  });
}

module.exports = seedAboutPage; 