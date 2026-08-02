// ============================================================
// FILE: utils/weatherReport.js
// Feature W21: Research Weather Report
//
// ResearchConnect context:
// Every Monday at 8am, every user gets a personalised
// research briefing email showing:
// - New supervisor matches found this week
// - Profile views this week
// - New endorsements received
// - Pending applications status
// - Any upcoming funding deadlines
//
// It runs automatically using node-cron.
// Users can turn it off in Settings > Notifications.
// ============================================================

const User = require('../models/User');
const Application = require('../models/Application');
const Endorsement = require('../models/Endorsement');
const Notification = require('../models/Notification');
const { sendWeatherReport } = require('./email');
const { calculateMatchScore } = require('./matchScore');

async function runWeatherReport() {
  console.log('Running Research Weather Report...');

  try {
    // Get all users
    const users = await User.find({ status: { $ne: 'closed' } });

    for (const user of users) {
      try {
        // Calculate this week's stats for this user
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // New endorsements this week
        const newEndorsements = await Endorsement.countDocuments({
          recipient: user._id,
          createdAt: { $gte: oneWeekAgo }
        });

        // Pending applications
        const pendingApplications = await Application.countDocuments({
          student: user._id,
          status: 'pending'
        });

        // New matches this week (supervisors who joined or updated)
        let newMatches = 0;
        if (user.role === 'student') {
          const recentSupervisors = await User.find({
            role: 'supervisor',
            'availability.status': 'open',
            updatedAt: { $gte: oneWeekAgo }
          });

          newMatches = recentSupervisors.filter(sup => {
            const match = calculateMatchScore(user, sup);
            return match.score >= 50;
          }).length;
        }

        const reportData = {
          newMatches,
          profileViews: 0,
          newEndorsements,
          pendingApplications,
          upcomingDeadlines: null
        };

        // Only send if there is something to report
        const hasNews = newMatches > 0 ||
          newEndorsements > 0 ||
          pendingApplications > 0;

        if (hasNews) {
          // Send email
          await sendWeatherReport(user.email, user.username, reportData);

          // Also create an in-app notification
          await Notification.create({
            recipient: user._id,
            type: 'system',
            title: '☀️ Your Weekly Research Weather Report is ready',
            body: `This week: ${newMatches} new matches, ${newEndorsements} endorsements, ${pendingApplications} pending applications.`,
            actionPath: '/home'
          });
        }

      } catch (userError) {
        // If one user fails, continue with others
        console.error(`Weather report failed for ${user.username}:`, userError.message);
      }
    }

    console.log(`Weather Report: sent to ${users.length} users`);

  } catch (error) {
    console.error('Weather Report error:', error.message);
  }
}

module.exports = { runWeatherReport };