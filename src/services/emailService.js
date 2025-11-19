const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
    this.init();
  }

  /**
   * Initialize the email transporter
   */
  init() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: process.env.MAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USERNAME || 'jobc453@gmail.com',
          pass: process.env.MAIL_PASSWORD || 'nojoowpiacaoxxet'
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email service initialization failed:', error);
          this.isInitialized = false;
        } else {
          console.log('✅ Email service initialized successfully');
          this.isInitialized = true;
        }
      });
    } catch (error) {
      console.error('❌ Error creating email transporter:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Send job application notification email
   */
  async sendJobApplicationEmail(applicationData) {
    if (!this.isInitialized) {
      console.error('❌ Email service not initialized');
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const { job, applicant, application } = applicationData;
      
      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'HarPalJob'}" <${process.env.MAIL_FROM_ADDRESS || 'jobc453@gmail.com'}>`,
        to: job.postedJobs?.email || 'admin@harpaljob.com', // Send to job poster or admin
        subject: `New Job Application: ${job.title}`,
        html: this.generateJobApplicationEmailHTML(applicationData),
        text: this.generateJobApplicationEmailText(applicationData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Job application email sent successfully:', result.messageId);
      
      return { 
        success: true, 
        messageId: result.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('❌ Error sending job application email:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Send application confirmation email to applicant
   */
  async sendApplicationConfirmationEmail(applicationData) {
    if (!this.isInitialized) {
      console.error('❌ Email service not initialized');
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const { job, applicant, application } = applicationData;
      const applicantEmail = applicant.email || applicant.userId?.email;
      
      if (!applicantEmail) {
        console.warn('⚠️ No applicant email found for confirmation');
        return { success: false, error: 'No applicant email found' };
      }

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'HarPalJob'}" <${process.env.MAIL_FROM_ADDRESS || 'jobc453@gmail.com'}>`,
        to: applicantEmail,
        subject: `Application Confirmation: ${job.title}`,
        html: this.generateConfirmationEmailHTML(applicationData),
        text: this.generateConfirmationEmailText(applicationData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Application confirmation email sent successfully:', result.messageId);
      
      return { 
        success: true, 
        messageId: result.messageId,
        message: 'Confirmation email sent successfully'
      };
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Generate HTML email template for job application notification
   */
  generateJobApplicationEmailHTML(data) {
    const { job, applicant, application } = data;
    const applicantName = applicant.firstName && applicant.lastName 
      ? `${applicant.firstName} ${applicant.lastName}` 
      : 'Anonymous Applicant';
    const applicantEmail = applicant.email || 'No email provided';
    const applicantPhone = applicant.phone || 'No phone provided';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Job Application</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976D2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .job-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #1976D2; }
            .applicant-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
            .cover-letter { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #1976D2; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 New Job Application Received!</h1>
                <p>You have received a new application for your job posting</p>
            </div>
            
            <div class="content">
                <div class="job-details">
                    <h3>📋 Job Details</h3>
                    <p><strong>Position:</strong> ${job.title}</p>
                    <p><strong>Company:</strong> ${job.company?.name || 'N/A'}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Job Type:</strong> ${job.jobType}</p>
                    <p><strong>Application Date:</strong> ${new Date(application.appliedAt).toLocaleDateString()}</p>
                </div>

                <div class="applicant-details">
                    <h3>👤 Applicant Information</h3>
                    <p><strong>Name:</strong> ${applicantName}</p>
                    <p><strong>Email:</strong> ${applicantEmail}</p>
                    <p><strong>Phone:</strong> ${applicantPhone}</p>
                    ${application.resumeUrl ? `<p><strong>Resume:</strong> <a href="${application.resumeUrl}" target="_blank">View Resume</a></p>` : ''}
                </div>

                ${application.coverLetter ? `
                <div class="cover-letter">
                    <h3>📝 Cover Letter</h3>
                    <p>${application.coverLetter.replace(/\n/g, '<br>')}</p>
                </div>
                ` : ''}

                <div style="text-align: center; margin: 20px 0;">
                    <a href="https://harpaljob.com/admin/applications/${application.id}" class="button">
                        View Full Application
                    </a>
                </div>
            </div>

            <div class="footer">
                <p>This email was sent from HarPalJob.com</p>
                <p>If you have any questions, please contact our support team.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate text email template for job application notification
   */
  generateJobApplicationEmailText(data) {
    const { job, applicant, application } = data;
    const applicantName = applicant.firstName && applicant.lastName 
      ? `${applicant.firstName} ${applicant.lastName}` 
      : 'Anonymous Applicant';

    return `
New Job Application Received!

Job Details:
- Position: ${job.title}
- Company: ${job.company?.name || 'N/A'}
- Location: ${job.location}
- Job Type: ${job.jobType}
- Application Date: ${new Date(application.appliedAt).toLocaleDateString()}

Applicant Information:
- Name: ${applicantName}
- Email: ${applicant.email || 'No email provided'}
- Phone: ${applicant.phone || 'No phone provided'}
${application.resumeUrl ? `- Resume: ${application.resumeUrl}` : ''}

${application.coverLetter ? `Cover Letter:\n${application.coverLetter}\n` : ''}

View full application: https://harpaljob.com/admin/applications/${application.id}

---
This email was sent from HarPalJob.com
    `;
  }

  /**
   * Generate HTML email template for application confirmation
   */
  generateConfirmationEmailHTML(data) {
    const { job, applicant, application } = data;
    const applicantName = applicant.firstName && applicant.lastName 
      ? `${applicant.firstName} ${applicant.lastName}` 
      : 'Dear Applicant';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .job-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Application Submitted Successfully!</h1>
                <p>Thank you for applying through HarPalJob</p>
            </div>
            
            <div class="content">
                <p>Dear ${applicantName},</p>
                
                <p>We have successfully received your job application. Here are the details:</p>

                <div class="job-details">
                    <h3>📋 Application Details</h3>
                    <p><strong>Position Applied For:</strong> ${job.title}</p>
                    <p><strong>Company:</strong> ${job.company?.name || 'N/A'}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Application Date:</strong> ${new Date(application.appliedAt).toLocaleDateString()}</p>
                    <p><strong>Application ID:</strong> #${application.id}</p>
                    <p><strong>Status:</strong> ${application.status}</p>
                </div>

                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>The employer will review your application</li>
                    <li>You will be notified of any status updates</li>
                    <li>If shortlisted, you may be contacted for an interview</li>
                </ul>

                <div style="text-align: center; margin: 20px 0;">
                    <a href="https://harpaljob.com/jobs/${job.slug}" class="button">
                        View Job Details
                    </a>
                </div>

                <p>Thank you for using HarPalJob. We wish you the best of luck!</p>
            </div>

            <div class="footer">
                <p>This email was sent from HarPalJob.com</p>
                <p>If you have any questions, please contact our support team.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate text email template for application confirmation
   */
  generateConfirmationEmailText(data) {
    const { job, applicant, application } = data;
    const applicantName = applicant.firstName && applicant.lastName 
      ? `${applicant.firstName} ${applicant.lastName}` 
      : 'Dear Applicant';

    return `
Application Submitted Successfully!

Dear ${applicantName},

We have successfully received your job application. Here are the details:

Application Details:
- Position Applied For: ${job.title}
- Company: ${job.company?.name || 'N/A'}
- Location: ${job.location}
- Application Date: ${new Date(application.appliedAt).toLocaleDateString()}
- Application ID: #${application.id}
- Status: ${application.status}

What happens next?
- The employer will review your application
- You will be notified of any status updates
- If shortlisted, you may be contacted for an interview

View job details: https://harpaljob.com/jobs/${job.slug}

Thank you for using HarPalJob. We wish you the best of luck!

---
This email was sent from HarPalJob.com
    `;
  }

  /**
   * Test email functionality
   */
  async testEmail() {
    if (!this.isInitialized) {
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'HarPalJob'}" <${process.env.MAIL_FROM_ADDRESS || 'jobc453@gmail.com'}>`,
        to: process.env.MAIL_FROM_ADDRESS || 'jobc453@gmail.com',
        subject: 'HarPalJob Email Service Test',
        html: `
          <h2>Email Service Test</h2>
          <p>This is a test email from HarPalJob backend.</p>
          <p>If you receive this email, the email service is working correctly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `,
        text: `
Email Service Test

This is a test email from HarPalJob backend.

If you receive this email, the email service is working correctly!

Timestamp: ${new Date().toISOString()}
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Test email sent successfully:', result.messageId);
      
      return { 
        success: true, 
        messageId: result.messageId,
        message: 'Test email sent successfully'
      };
    } catch (error) {
      console.error('❌ Error sending test email:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

module.exports = new EmailService();
