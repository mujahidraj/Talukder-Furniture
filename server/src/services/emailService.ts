import nodemailer from 'nodemailer';
import config from '../config/index.js';

// Create a transporter
// In production, configure with actual SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // generated ethereal user
    pass: process.env.SMTP_PASS, // generated ethereal password
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Talukder Furniture" <${process.env.SMTP_USER || 'noreply@talukder-furniture.com'}>`,
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    
    // Preview only available when sending through an Ethereal account
    if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw to prevent breaking the main flow (e.g. lead creation)
    return false;
  }
};

/**
 * Escape HTML entities to prevent injection in email templates.
 */
const escapeHtml = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const sendLeadNotification = async (lead: any) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@talukder-furniture.com';
  
  // Escape user input to prevent HTML injection in email body
  const safeName = escapeHtml(lead.name);
  const safeEmail = escapeHtml(lead.email);
  const safePhone = escapeHtml(lead.phone) || 'N/A';
  const safeSubject = escapeHtml(lead.subject || lead.category || 'General Inquiry');
  const safeMessage = escapeHtml(lead.message);

  const subject = `New Inquiry: ${lead.subject || lead.category || 'General Inquiry'}`;
  const html = `
    <h2>New Inquiry Received</h2>
    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Phone:</strong> ${safePhone}</p>
    <p><strong>Subject:</strong> ${safeSubject}</p>
    <h3>Message:</h3>
    <p>${safeMessage}</p>
  `;

  return sendEmail(adminEmail, subject, html);
};
