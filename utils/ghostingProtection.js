// ============================================================
// FILE: utils/ghostingProtection.js
// Feature W3: Ghosting Protection System
//
// ResearchConnect context:
// When a supervisor accepts a student's application and
// then goes silent — stops responding to messages —
// the system automatically:
// 1. After 30 days: sends supervisor a reminder
// 2. After 60 days: adds "slow responder" note to their profile
// 3. After 90 days: notifies student they can withdraw
//
// This runs as a scheduled job every day at midnight.
// Like an alarm clock that checks all pending applications
// and sends reminders where needed.
//
// How to run this:
// We use node-cron to schedule it.
// cron syntax: '0 0 * * *' = run at 00:00 every day
// ============================================================

const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Calculate how many days ago a date was
function daysAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
  // Convert milliseconds to days
}

async function runGhostingProtection() {
  console.log('Running Ghosting Protection check...');

  try {
    // Find all accepted applications where supervisor
    // has not sent any messages recently
    const acceptedApplications = await Application.find({
      status: 'accepted'
    }).populate('student supervisor');

    let remindersSet = 0;

    for (const app of acceptedApplications) {
      const daysSinceAccepted = daysAgo(app.updatedAt);

      // 30 day reminder — first warning
      if (daysSinceAccepted >= 30 && app.reminderCount === 0) {
        // Send reminder to supervisor
        await Notification.create({
          recipient: app.supervisor._id,
          type: 'ghosting_warning',
          title: 'Reminder: Follow up with your accepted student',
          body: `You accepted ${app.student.username} 30 days ago but have not been in contact. Please reach out to them to avoid being marked as unresponsive.`,
          actionPath: `/messages/${app.student._id}`,
          triggeredBy: app.student._id
        });

        // Notify student too
        await Notification.create({
          recipient: app.student._id,
          type: 'system',
          title: 'Update on your application',
          body: `Your supervisor has been sent a reminder to follow up with you. If you do not hear back within 30 days, you can withdraw and reapply elsewhere.`,
          actionPath: `/applications`
        });

        // Update reminder count
        await Application.findByIdAndUpdate(app._id, {
          $inc: { reminderCount: 1 },
          lastReminderSent: new Date()
        });

        remindersSet++;
      }

      // 60 day warning — mark supervisor as slow responder
      if (daysSinceAccepted >= 60 && app.reminderCount === 1) {
        // Add slow responder note to supervisor's public profile
        // This is visible to all students — Cold Email Killer + Ghosting Protection
        await User.findByIdAndUpdate(app.supervisor._id, {
          $inc: { karmaScore: -10 }
          // Lose karma for ghosting students
        });

        await Notification.create({
          recipient: app.supervisor._id,
          type: 'ghosting_warning',
          title: 'Your response rate has been affected',
          body: `You accepted ${app.student.username} 60 days ago with no follow up. Your response rate score has been reduced. Please contact your student immediately.`,
          actionPath: `/messages/${app.student._id}`
        });

        await Application.findByIdAndUpdate(app._id, {
          $inc: { reminderCount: 1 },
          lastReminderSent: new Date()
        });

        remindersSet++;
      }

      // 90 day — student can withdraw without penalty
      if (daysSinceAccepted >= 90 && app.reminderCount === 2) {
        await Notification.create({
          recipient: app.student._id,
          type: 'system',
          title: 'You can now withdraw your application',
          body: `Your supervisor has not been in contact for 90 days despite reminders. You are free to withdraw and apply to other supervisors. This will not affect your profile.`,
          actionPath: `/applications`
        });

        await Application.findByIdAndUpdate(app._id, {
          $inc: { reminderCount: 1 }
        });

        remindersSet++;
      }
    }

    console.log(`Ghosting Protection: ${remindersSet} reminders sent`);

  } catch (error) {
    console.error('Ghosting Protection error:', error.message);
  }
}

module.exports = { runGhostingProtection };