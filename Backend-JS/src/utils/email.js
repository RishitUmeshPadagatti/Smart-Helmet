// src/utils/email.js
const nodemailer = require('nodemailer');

const sendEmail = async (reportData) => {
  const {
    type,
    subject,
    title,
    description,
    location,
    timestamp,
    photoUrl,
    reporterDetails,
    metadata
  } = reportData;

  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Format metadata as HTML list items
  const metadataHtml = Object.entries(metadata || {})
    .map(([key, value]) => `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> ${value}</li>`)
    .join('\n');

  // Add Number Plate to subject if available for Traffic reports
  const displaySubject = metadata?.['Vehicle Number Plate'] 
    ? `${subject} - ${metadata['Vehicle Number Plate']}` 
    : subject;

  // Construct HTML body
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-top: 0;">${subject}</h2>
      
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #f1f5f9;">
        <h3 style="margin-top: 0; color: #334155; font-size: 16px;">🚨 Vital Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; width: 40%;"><strong>Timestamp:</strong></td>
            <td style="padding: 4px 0; color: #0f172a;">${new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>
          ${metadata?.['Vehicle Number Plate'] ? `
          <tr>
            <td style="padding: 4px 0; color: #64748b;"><strong>Vehicle Number:</strong></td>
            <td style="padding: 4px 0; color: #ef4444; font-weight: bold; font-size: 18px;">${metadata['Vehicle Number Plate']}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 4px 0; color: #64748b;"><strong>Location:</strong></td>
            <td style="padding: 4px 0; color: #0f172a;">${location}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="margin-top: 0; color: #334155; font-size: 16px;">📋 Report Details</h3>
        <ul style="list-style: none; padding-left: 0; margin: 0;">
          <li style="padding: 4px 0;"><strong>Detection Type:</strong> ${type}</li>
          ${title ? `<li style="padding: 4px 0;"><strong>Observation:</strong> ${title}</li>` : ''}
          ${description ? `<li style="padding: 4px 0;"><strong>Context:</strong> ${description}</li>` : ''}
          ${reporterDetails ? `<li style="padding: 4px 0;"><strong>Reported By:</strong> ${reporterDetails}</li>` : ''}
        </ul>
      </div>

      ${metadataHtml ? `
      <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="margin-top: 0; color: #1d4ed8; font-size: 16px;">🔍 AI Analysis Metadata</h3>
        <ul style="list-style: none; padding-left: 0; margin: 0;">
          ${metadataHtml}
        </ul>
      </div>
      ` : ''}

      <div style="margin-top: 24px; text-align: center;">
        <h3 style="color: #334155; font-size: 16px; margin-bottom: 12px; text-align: left;">📸 Evidence Frame</h3>
        <img src="${photoUrl}" alt="Violation Proof" style="width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
        <p style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Direct Link: <a href="${photoUrl}" style="color: #3b82f6;">Open Evidence in Browser</a></p>
      </div>

      <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
        <p>This is a system-generated alert from the <strong>Smart Helmet Safety Network</strong>.</p>
      </div>
    </div>
  `;

  // Email options
  const mailOptions = {
    from: `"Smart Helmet Security" <${process.env.SMTP_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    subject: displaySubject,
    html: htmlBody,
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };
