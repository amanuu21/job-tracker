const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

const emailTemplates = {
  verification: (name, token, frontendUrl) => ({
    subject: 'Verify Your Email - Job Tracker',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:10px">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;border-radius:10px 10px 0 0;text-align:center">
          <h1 style="color:white;margin:0">Job Tracker</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 10px 10px">
          <h2>Hello ${name}!</h2>
          <p>Thank you for registering. Please verify your email address to activate your account.</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${frontendUrl}/verify-email?token=${token}" 
               style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:15px 30px;border-radius:25px;text-decoration:none;font-weight:bold;display:inline-block">
              Verify Email Address
            </a>
          </div>
          <p style="color:#666;font-size:14px">This link expires in 24 hours. If you didn't register, please ignore this email.</p>
        </div>
      </div>
    `
  }),

  passwordReset: (name, token, frontendUrl) => ({
    subject: 'Reset Your Password - Job Tracker',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:10px">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;border-radius:10px 10px 0 0;text-align:center">
          <h1 style="color:white;margin:0">Job Tracker</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 10px 10px">
          <h2>Hello ${name}!</h2>
          <p>You requested a password reset. Click the button below to set a new password.</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${frontendUrl}/reset-password?token=${token}" 
               style="background:linear-gradient(135deg,#e74c3c,#c0392b);color:white;padding:15px 30px;border-radius:25px;text-decoration:none;font-weight:bold;display:inline-block">
              Reset Password
            </a>
          </div>
          <p style="color:#666;font-size:14px">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `
  }),

  applicationStatus: (name, jobTitle, status) => ({
    subject: `Application Update: ${jobTitle} - Job Tracker`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:10px">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;border-radius:10px 10px 0 0;text-align:center">
          <h1 style="color:white;margin:0">Job Tracker</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 10px 10px">
          <h2>Hello ${name}!</h2>
          <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
          <div style="background:#f0f4ff;padding:20px;border-radius:8px;text-align:center;margin:20px 0">
            <p style="margin:0;font-size:18px">New Status: <strong style="color:#667eea">${status.replace(/_/g,' ').toUpperCase()}</strong></p>
          </div>
          <p>Log in to your dashboard to view more details.</p>
        </div>
      </div>
    `
  })
};

module.exports = { sendEmail, emailTemplates };
