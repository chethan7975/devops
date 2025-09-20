const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // For development, use a test account or console logging
    return {
      sendMail: (options) => {
        console.log('📧 Email would be sent:', {
          to: options.to,
          subject: options.subject,
          text: options.text
        });
        return Promise.resolve({ messageId: 'test-message-id' });
      }
    };
  }
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  certificateIssued: (volunteerName, ngoName, serviceDays, verificationCode) => ({
    subject: `🎉 Certificate Issued - ${ngoName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🏆 Certificate Issued!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Congratulations on your achievement</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${volunteerName}!</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            We're thrilled to inform you that you've been awarded a certificate for your outstanding volunteer service with <strong>${ngoName}</strong>!
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Certificate Details</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li><strong>Organization:</strong> ${ngoName}</li>
              <li><strong>Service Days:</strong> ${serviceDays} days</li>
              <li><strong>Verification Code:</strong> ${verificationCode}</li>
              <li><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
            Your dedication and commitment to making a difference in the community is truly inspiring. 
            This certificate recognizes your valuable contribution and can be used for professional development, 
            college applications, or personal achievement records.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/volunteer/dashboard" 
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              View Your Certificate
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Thank you for your continued service and dedication to making the world a better place!
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">
              Best regards,<br>
              The ${ngoName} Team
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Certificate Issued - ${ngoName}
      
      Hello ${volunteerName}!
      
      Congratulations! You've been awarded a certificate for your volunteer service with ${ngoName}.
      
      Certificate Details:
      - Organization: ${ngoName}
      - Service Days: ${serviceDays} days
      - Verification Code: ${verificationCode}
      - Issue Date: ${new Date().toLocaleDateString()}
      
      You can view and download your certificate from your dashboard: ${process.env.CLIENT_URL}/volunteer/dashboard
      
      Thank you for your dedication to making a difference!
      
      Best regards,
      The ${ngoName} Team
    `
  }),

  volunteerApproved: (volunteerName, ngoName) => ({
    subject: `✅ Application Approved - Welcome to ${ngoName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Welcome Aboard!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your application has been approved</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${volunteerName}!</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your volunteer application with <strong>${ngoName}</strong> has been approved. 
            You can now start tracking your volunteer service and earning certificates!
          </p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1f2937; margin-top: 0;">What's Next?</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li>Log in to your dashboard</li>
              <li>Start marking your daily volunteer service</li>
              <li>Track your progress towards earning certificates</li>
              <li>Connect with other volunteers in your organization</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/volunteer/dashboard" 
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              We're excited to have you join our volunteer community!
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">
              Best regards,<br>
              The ${ngoName} Team
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Application Approved - Welcome to ${ngoName}
      
      Hello ${volunteerName}!
      
      Great news! Your volunteer application with ${ngoName} has been approved.
      
      What's Next:
      - Log in to your dashboard
      - Start marking your daily volunteer service
      - Track your progress towards earning certificates
      - Connect with other volunteers in your organization
      
      Access your dashboard: ${process.env.CLIENT_URL}/volunteer/dashboard
      
      We're excited to have you join our volunteer community!
      
      Best regards,
      The ${ngoName} Team
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = template(...data);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@volunteerhub.com',
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Specific email functions
const sendCertificateIssuedEmail = async (volunteerEmail, volunteerName, ngoName, serviceDays, verificationCode) => {
  return await sendEmail(
    volunteerEmail,
    emailTemplates.certificateIssued,
    [volunteerName, ngoName, serviceDays, verificationCode]
  );
};

const sendVolunteerApprovedEmail = async (volunteerEmail, volunteerName, ngoName) => {
  return await sendEmail(
    volunteerEmail,
    emailTemplates.volunteerApproved,
    [volunteerName, ngoName]
  );
};

module.exports = {
  sendEmail,
  sendCertificateIssuedEmail,
  sendVolunteerApprovedEmail,
  emailTemplates
};