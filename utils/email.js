// ============================================================
// FILE: utils/email.js
// Email sending utility using nodemailer
//
// ResearchConnect context:
// Sends emails for:
// - Password reset links
// - Application accepted/declined notifications
// - New match alerts
// - Weekly research weather report
//
// For development: emails print to console
// For production: use Gmail, SendGrid, or Mailgun
// ============================================================

const nodemailer = require('nodemailer');

// Create transporter
// In development we use a test account that logs to console
// In production replace with real SMTP credentials
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production — use real email service
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development — log emails to console instead of sending
    return {
      sendMail: async (options) => {
        console.log('\n📧 EMAIL (Development Mode):');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Content:', options.text || options.html);
        console.log('---\n');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }
};

// ── SEND PASSWORD RESET EMAIL ─────────────────────────────
const sendPasswordResetEmail = async (email, username, resetToken) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: '"ResearchConnect" <noreply@researchconnect.co.uk>',
    to: email,
    subject: 'Reset your ResearchConnect password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B3A6B;">Reset Your Password</h2>
        <p>Hi ${username},</p>
        <p>You requested a password reset for your ResearchConnect account.</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #FFD700; color: #0d1b2e; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
          Reset Password
        </a>
        <p>If you did not request this, ignore this email. Your password will not change.</p>
        <p>The ResearchConnect Team</p>
      </div>
    `
  });
};

// ── SEND APPLICATION NOTIFICATION EMAIL ──────────────────
const sendApplicationEmail = async (email, username, status, supervisorName) => {
  const transporter = createTransporter();

  const subject = status === 'accepted'
    ? `Great news — ${supervisorName} accepted your application`
    : `Update on your application to ${supervisorName}`;

  const message = status === 'accepted'
    ? `Congratulations! ${supervisorName} has accepted your research application. Log in to ResearchConnect to see their message and next steps.`
    : `${supervisorName} has reviewed your application. Log in to ResearchConnect to see their response.`;

  await transporter.sendMail({
    from: '"ResearchConnect" <noreply@researchconnect.co.uk>',
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B3A6B;">${subject}</h2>
        <p>Hi ${username},</p>
        <p>${message}</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/applications" 
           style="display: inline-block; padding: 12px 24px; background: #FFD700; color: #0d1b2e; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
          View Application
        </a>
        <p>The ResearchConnect Team</p>
      </div>
    `
  });
};

// ── SEND NEW MATCH EMAIL ──────────────────────────────────
const sendNewMatchEmail = async (email, username, supervisorName, matchScore) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: '"ResearchConnect" <noreply@researchconnect.co.uk>',
    to: email,
    subject: `New ${matchScore}% research match found — ${supervisorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B3A6B;">New Research Match Found</h2>
        <p>Hi ${username},</p>
        <p>We found a new supervisor match for you:</p>
        <div style="background: #f0f9ff; border-left: 4px solid #1B3A6B; padding: 16px; margin: 16px 0;">
          <strong>${supervisorName}</strong> — ${matchScore}% research match
        </div>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/matches" 
           style="display: inline-block; padding: 12px 24px; background: #FFD700; color: #0d1b2e; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
          View Match
        </a>
        <p>The ResearchConnect Team</p>
      </div>
    `
  });
};

// ── SEND RESEARCH WEATHER REPORT ─────────────────────────
const sendWeatherReport = async (email, username, reportData) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: '"ResearchConnect" <noreply@researchconnect.co.uk>',
    to: email,
    subject: `☀️ Your Research Weather Report — ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B3A6B;">☀️ Your Weekly Research Weather Report</h2>
        <p>Hi ${username}, here is your personalised research briefing:</p>
        <ul>
          ${reportData.newMatches > 0 ? `<li>⚡ ${reportData.newMatches} new supervisor matches found</li>` : ''}
          ${reportData.profileViews > 0 ? `<li>👁️ Your profile was viewed ${reportData.profileViews} times this week</li>` : ''}
          ${reportData.newEndorsements > 0 ? `<li>✓ You received ${reportData.newEndorsements} new skill endorsements</li>` : ''}
          ${reportData.pendingApplications > 0 ? `<li>📋 You have ${reportData.pendingApplications} pending applications</li>` : ''}
          ${reportData.upcomingDeadlines ? `<li>⚠️ ${reportData.upcomingDeadlines}</li>` : ''}
        </ul>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/home" 
           style="display: inline-block; padding: 12px 24px; background: #FFD700; color: #0d1b2e; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
          Open ResearchConnect
        </a>
        <p>The ResearchConnect Team</p>
      </div>
    `
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendApplicationEmail,
  sendNewMatchEmail,
  sendWeatherReport
};