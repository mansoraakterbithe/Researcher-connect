// ============================================================
// FILE: routes/match.js
// Match routes — AI-powered researcher matching
//
// ResearchConnect context:
// The Smart Match Feed shows students a ranked list of
// supervisors who are most compatible with their research.
// The match score is calculated using the Jaccard similarity
// algorithm in utils/matchScore.js
//
// Later in Phase 2, this will be upgraded to use
// Python Sentence Transformers for semantic matching.
// The route structure stays the same — only the
// calculation inside changes.
// ============================================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { calculateMatchScore } = require('../utils/matchScore');

// ── ROUTE 1: GET /api/match/supervisors ──────────────────
// Get AI-ranked list of supervisor matches for a student
// Used by: Smart Match Feed (/matches page)
//
// ResearchConnect context:
// Mansora opens her Matches page and sees:
// 1. Dr. Sarah Chen (UCL) — 87% match
// 2. Prof. Ahmed Hassan (Manchester) — 76% match
// 3. Dr. Priya Sharma (Edinburgh) — 68% match
//
// Ranked by match score — best match first.
// Only shows supervisors who are open or have limited spots.
router.get('/supervisors', protect, async (req, res) => {
  try {
    // Only students can get supervisor matches
    if (req.user.role === 'supervisor') {
      return res.status(403).json({
        message: 'This feature is for students only'
      });
    }

    // Get all supervisors who are currently open or limited
    const supervisors = await User.find({
      role: 'supervisor',
      'availability.status': { $in: ['open', 'limited'] }
    }).select('-password -email -matchScoreCache');

    // Calculate match score for each supervisor
    const matches = supervisors.map(supervisor => {
      const matchResult = calculateMatchScore(req.user, supervisor);
      return {
        supervisor,
        matchScore: matchResult.score,
        breakdown: matchResult.breakdown
      };
    });

    // Sort by match score — highest first
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Filter out very low matches (below 10%)
    const relevantMatches = matches.filter(m => m.matchScore >= 10);

    res.status(200).json({
      matches: relevantMatches,
      totalMatches: relevantMatches.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: GET /api/match/score/:id ────────────────────
// Get match score between current user and a specific user
// Used by: Profile page — shows "94% Research Match"
//
// ResearchConnect context:
// When Mansora views Dr. Sarah Chen's profile,
// the frontend calls this route to get their specific
// match score and show it in the green badge.
router.get('/score/:id', protect, async (req, res) => {
  try {
    const otherUser = await User.findById(req.params.id)
      .select('-password -email');

    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate match in the right direction
    // Student vs Supervisor or vice versa
    let matchResult;
    if (req.user.role === 'student') {
      matchResult = calculateMatchScore(req.user, otherUser);
    } else {
      matchResult = calculateMatchScore(otherUser, req.user);
    }

    res.status(200).json({
      matchScore: matchResult.score,
      breakdown: matchResult.breakdown,
      user1: req.user.username,
      user2: otherUser.username
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: GET /api/match/students ─────────────────────
// Get matching students for a supervisor
// Used by: Supervisor dashboard — "Students looking for you"
//
// ResearchConnect context:
// Dr. Sarah Chen opens her dashboard and sees which
// students are actively seeking supervisors in her field.
// Ranked by how well they match her research areas.
router.get('/students', protect, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({
        message: 'This feature is for supervisors only'
      });
    }

    // Get students who are actively seeking supervisors
    const students = await User.find({
      role: 'student',
      seekingSupervisor: true
    }).select('-password -email -matchScoreCache');

    // Calculate match score for each student
    const matches = students.map(student => {
      const matchResult = calculateMatchScore(student, req.user);
      return {
        student,
        matchScore: matchResult.score,
        breakdown: matchResult.breakdown
      };
    });

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    const relevantMatches = matches.filter(m => m.matchScore >= 10);

    res.status(200).json({
      matches: relevantMatches,
      totalMatches: relevantMatches.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;