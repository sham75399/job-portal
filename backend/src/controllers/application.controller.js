const Application = require('../models/Application.model');
const Job = require('../models/Job.model');
const nodemailer = require('nodemailer');

// Create transporter only if email credentials are provided
let transporter = null;
let emailConfigured = false;

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Add timeout and connection settings
      timeout: 5000,
      connectionTimeout: 5000
    });
    emailConfigured = true;
    console.log('Email transporter configured successfully');
  } else {
    console.log('Email credentials not provided or using default. Email notifications will be disabled.');
    console.log('To enable email, set EMAIL_USER and EMAIL_PASS in .env file');
  }
} catch (error) {
  console.error('Failed to configure email transporter:', error.message);
  emailConfigured = false;
}

// Helper function to send email with better error handling
const sendEmail = async (to, subject, html) => {
  if (!emailConfigured || !transporter) {
    console.log('Email not sent: Transporter not configured');
    return { success: false, error: 'Email not configured' };
  }

  try {
    // Verify connection first
    await transporter.verify();
    
    const info = await transporter.sendMail({
      from: `"Job Board" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent successfully to:', to, 'Message ID:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    // Don't throw error - just log it
    return { success: false, error: error.message };
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ error: 'Job not found or not active' });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'Already applied for this job' });
    }

    const resumeFile = req.file;
    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume is required' });
    }

    const application = new Application({
      job: jobId,
      applicant: req.user.id,
      coverLetter,
      resume: resumeFile.path.replace(/\\/g, '/')
    });

    await application.save();

    job.applications.push(application._id);
    await job.save();

    // Try to send email but don't fail if it doesn't work
    try {
      await sendEmail(
        req.user.email,
        'Application Received - Job Board',
        `
          <h2>Application Received</h2>
          <p>Thank you for applying for <strong>${job.title}</strong> at ${job.company}.</p>
          <p>Your application has been successfully submitted.</p>
          <p>Best regards,<br>Job Board Team</p>
        `
      );
    } catch (emailError) {
      // Email failed but application was successful
      console.log('Email notification failed but application was saved');
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location type salary')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'name email phone location skills')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await Application.findById(applicationId)
      .populate('job', 'postedBy title company')
      .populate('applicant', 'email name');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    application.status = status;
    application.updatedAt = Date.now();
    await application.save();

    // Try to send email notification
    try {
      const statusMessages = {
        reviewed: 'has been reviewed by the employer.',
        shortlisted: 'you have been shortlisted for the next round.',
        rejected: 'the employer has decided not to proceed with your application.',
        hired: 'Congratulations! You have been selected for the position!'
      };

      await sendEmail(
        application.applicant.email,
        'Application Status Update - Job Board',
        `
          <h2>Application Status Update</h2>
          <p>Dear ${application.applicant.name},</p>
          <p>Your application for <strong>${application.job.title}</strong> at ${application.job.company} ${statusMessages[status] || 'has been updated.'}</p>
          <p>Best regards,<br>Job Board Team</p>
        `
      );
    } catch (emailError) {
      console.log('Status update email failed but status was updated');
    }

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Test email endpoint (for debugging)
exports.testEmail = async (req, res) => {
  try {
    const result = await sendEmail(
      req.user.email,
      'Test Email - Job Board',
      '<h2>Test Email</h2><p>If you see this, email is working!</p>'
    );
    res.json({ message: 'Test email sent', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};