const { Contact, ContactInfo, FAQ } = require('../models');

// Submit contact form
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      message: 'Thank you for your message. We will get back to you soon!',
      contact
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Error submitting contact form' });
  }
};

// Get contact information
exports.getContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    });

    res.json(contactInfo);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({ message: 'Error fetching contact information' });
  }
};

// Get FAQs
exports.getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    });

    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
};

// Admin: Get all contact submissions
exports.getAllContactSubmissions = async (req, res) => {
  try {
    const submissions = await Contact.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({ message: 'Error fetching contact submissions' });
  }
};

// Admin: Update contact submission status
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    await contact.update({ status });
    res.json(contact);
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ message: 'Error updating contact status' });
  }
};

// Admin: Create/Update contact info
exports.updateContactInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, content, description, icon, isActive } = req.body;

    let contactInfo;
    if (id) {
      contactInfo = await ContactInfo.findByPk(id);
      if (!contactInfo) {
        return res.status(404).json({ message: 'Contact info not found' });
      }
      await contactInfo.update({
        type,
        title,
        content,
        description,
        icon,
        isActive
      });
    } else {
      contactInfo = await ContactInfo.create({
        type,
        title,
        content,
        description,
        icon,
        isActive
      });
    }

    res.json(contactInfo);
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({ message: 'Error updating contact information' });
  }
};

// Admin: Create/Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, isActive } = req.body;

    let faq;
    if (id) {
      faq = await FAQ.findByPk(id);
      if (!faq) {
        return res.status(404).json({ message: 'FAQ not found' });
      }
      await faq.update({
        question,
        answer,
        isActive
      });
    } else {
      faq = await FAQ.create({
        question,
        answer,
        isActive
      });
    }

    res.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ message: 'Error updating FAQ' });
  }
};

// Admin: Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByPk(id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await faq.destroy();
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ message: 'Error deleting FAQ' });
  }
}; 