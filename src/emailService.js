// emailService.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// For environment variables
dotenv.config();

// Create reusable transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'smartrichads@gmail.com',
    pass: 'rqtp zuyg xkvn nmym' // App password for Gmail
  }
});

// Function to send contact form emails
async function sendContactFormEmail(data) {
  const { name, email, subject, message } = data;
  
  try {
    // Setup email data
    const mailOptions = {
      from: 'The DNC Alliance <smartrichads@gmail.com>', // sender address
      to: 'smartrichads@gmail.com', // recipient address
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e52b2b;">New Contact Form Submission</h2>
          <hr style="border: 1px solid #eee;">
          <div style="margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <hr style="border: 1px solid #eee;">
          <p style="color: #777; font-size: 12px;">
            This email was sent from the contact form on The DNC Alliance dashboard.
          </p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

module.exports = { sendContactFormEmail };