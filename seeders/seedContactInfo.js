const { ContactInfo } = require('../src/models');

async function seedContactInfo() {
  await ContactInfo.bulkCreate([
    {
      type: 'email',
      title: 'Email Us',
      content: 'contact@harpaljob.com',
      description: 'Send us an email anytime!',
      icon: 'Mail',
      isActive: true
    },
    {
      type: 'phone',
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 6pm',
      icon: 'Phone',
      isActive: true
    },
    {
      type: 'address',
      title: 'Visit Us',
      content: '123 Business St, San Francisco, CA 94102',
      description: 'Come say hello at our office',
      icon: 'MapPin',
      isActive: true
    },
    {
      type: 'hours',
      title: 'Working Hours',
      content: 'Monday - Friday: 8:00 AM - 6:00 PM',
      description: 'Saturday: 9:00 AM - 3:00 PM',
      icon: 'Clock',
      isActive: true
    }
  ]);
}

module.exports = seedContactInfo; 