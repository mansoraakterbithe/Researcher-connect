// ============================================================
// FILE: routes/karma.js
// Karma routes — Research Karma System + Imposter Syndrome Score
//
// ResearchConnect context:
// Feature W5: Research Karma
// Researchers earn karma for helping others.
// They lose karma for bad behaviour like ghosting.
// High karma researchers appear higher in search results.
//
// Feature W4: Imposter Syndrome Score
// Uses your verified achievements to show you
// how well you are doing relative to your peers.
// "You are in the top 12% of researchers at your career stage."
// ============================================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Application = require('../models/Application');
const Endorsement = require('../models/Endorsement');
const { protect } = require('../middleware/auth');

// ── ROUTE 1: GET /api/karma/me ────────────────────────────
// Get my karma score and breakdown
// Used by: Profile page karma display
router.get('/me', protect, async (req, res) => {
  try {
    // Recalculate karma from scratch based on actual data
    // This ensures accuracy even if something was missed

    // Count posts
    const postsCount = await Post.countDocuments({
      author: req.user._id
    });

    // Count endorsements received
    const endorsementsReceived = await Endorsement.countDocuments({
      recipient: req.user._id
    });

    // Count endorsements given
    const endorsementsGiven = await Endorsement.countDocuments({
      endorser: req.user._id
    });

    // Count accepted applications (for supervisors)
    const acceptedApplications = await Application.countDocuments({
      supervisor: req.user._id,
      status: 'accepted'
    });

    // Calculate karma score
    const karmaBreakdown = {
      fromPosts: postsCount * 5,
      fromEndorsementsReceived: endorsementsReceived * 2,
      fromEndorsementsGiven: endorsementsGiven * 1,
      fromAcceptedApplications: acceptedApplications * 10,
      responseRateBonus: req.user.responseRate >= 80 ? 20 : 0
    };

    const totalKarma = Object.values(karmaBreakdown).reduce((a, b) => a + b, 0);

    // Update karma in database
    await User.findByIdAndUpdate(req.user._id, {
      karmaScore: totalKarma
    });

    res.status(200).json({
      karmaScore: totalKarma,
      breakdown: karmaBreakdown,
      level: getKarmaLevel(totalKarma)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper — get karma level title
function getKarmaLevel(score) {
  if (score >= 500) return { title: 'Research Legend', color: '#FFD700' };
  if (score >= 200) return { title: 'Senior Researcher', color: '#a78bfa' };
  if (score >= 100) return { title: 'Active Researcher', color: '#5BA4E6' };
  if (score >= 50) return { title: 'Rising Researcher', color: '#34d399' };
  return { title: 'New Researcher', color: '#ffffff' };
}

// ── ROUTE 2: GET /api/karma/imposter-score ────────────────
// Feature W4: Imposter Syndrome Score
// Get your achievements compared to your peer group
// Used by: Profile page, dashboard
//
// ResearchConnect context:
// Mansora opens her profile and sees:
// "You have published 1 IEEE paper, received 8 endorsements,
// and have a karma score of 47. You are in the top 23%
// of researchers at your career stage on ResearchConnect."
router.get('/imposter-score', protect, async (req, res) => {
  try {
    // Get all users at the same career stage
    // (same role, joined within 2 years of this user)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const peers = await User.find({
      role: req.user.role,
      createdAt: { $gte: twoYearsAgo },
      _id: { $ne: req.user._id }
    }).select('karmaScore impactScore');

    // Current user stats
    const userKarma = req.user.karmaScore;
    const userImpact = req.user.impactScore;

    // Count how many peers the user beats
    const peersBeatenByKarma = peers.filter(p => userKarma > p.karmaScore).length;
    const percentileKarma = peers.length > 0
      ? Math.round((peersBeatenByKarma / peers.length) * 100)
      : 50;

    // Count endorsements
    const endorsementsCount = await Endorsement.countDocuments({
      recipient: req.user._id
    });

    // Count posts
    const postsCount = await Post.countDocuments({
      author: req.user._id
    });

    // Build encouraging message based on data
    let message = '';
    if (percentileKarma >= 75) {
      message = `You are performing exceptionally well — in the top ${100 - percentileKarma}% of researchers at your career stage on ResearchConnect.`;
    } else if (percentileKarma >= 50) {
      message = `You are doing well — above average for researchers at your career stage. Keep engaging with the community to grow further.`;
    } else {
      message = `You are just getting started. Every researcher begins here. Post your first update, connect with others, and your score will grow quickly.`;
    }

    res.status(200).json({
      percentile: percentileKarma,
      message,
      achievements: {
        karmaScore: userKarma,
        impactScore: userImpact,
        endorsementsReceived: endorsementsCount,
        postsPublished: postsCount
      },
      peerCount: peers.length,
      encouragement: getEncouragement(percentileKarma)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function getEncouragement(percentile) {
  if (percentile >= 90) return '🏆 You are in the top 10% — outstanding researcher';
  if (percentile >= 75) return '⭐ Top 25% — you are doing great';
  if (percentile >= 50) return '📈 Above average — keep going';
  if (percentile >= 25) return '🌱 Growing — every expert started here';
  return '🚀 Just started — your journey begins now';
}

module.exports = router;