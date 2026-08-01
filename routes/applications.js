// ============================================================
// FILE: routes/applications.js
// Application routes — student applies to supervisor
//
// ResearchConnect context:
// This is the core of what makes ResearchConnect different
// from cold emailing. Instead of a student guessing a
// professor's email and hoping for a reply, they apply
// through the platform. The supervisor sees all applications
// in one place. Response rates are tracked publicly.
// ============================================================

const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ── ROUTE 1: POST /api/applications ──────────────────────
// Student submits an application to a supervisor
// Used by: Apply to Work With modal — Submit button
//
// ResearchConnect context:
// Mansora clicks "Apply to Work With" on Dr. Sarah Chen's
// profile. She fills in why she wants to work with her,
// her background, her proposed topic, and her funding needs.
// This route saves that application to MongoDB and
// notifies Dr. Sarah Chen.
router.post('/', protect, async (req, res) => {
  try {
    // Only students can apply
    if (req.user.role === 'supervisor') {
      return res.status(403).json({
        message: 'Supervisors cannot apply to other supervisors'
      });
    }

    const { supervisorId, why, background, topic, funding } = req.body;

    // Check the supervisor exists
    const supervisor = await User.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    // Check supervisor is actually a supervisor
    if (supervisor.role !== 'supervisor') {
      return res.status(400).json({
        message: 'You can only apply to verified supervisors'
      });
    }

    // Check if student already applied to this supervisor
    // The index we created prevents duplicates at DB level
    // but we check first to give a better error message
    const existingApplication = await Application.findOne({
      student: req.user._id,
      supervisor: supervisorId
    });

    if (existingApplication) {
      return res.status(400).json({
        message: 'You have already applied to this supervisor'
      });
    }

    // Create the application
    const application = await Application.create({
      student: req.user._id,
      supervisor: supervisorId,
      why,
      background,
      topic,
      funding
    });

    // Update supervisor's applicationsReceived count
    // This feeds into the Cold Email Killer feature
    await User.findByIdAndUpdate(supervisorId, {
      $inc: { applicationsReceived: 1 }
      // $inc increments a number field by the given amount
      // applicationsReceived goes from 0 to 1
    });

    // Populate student and supervisor info for the response
    await application.populate('student', 'username university profilePhoto');
    await application.populate('supervisor', 'username university profilePhoto');

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });

  } catch (error) {
    // Duplicate key error from MongoDB index
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already applied to this supervisor'
      });
    }
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: GET /api/applications/mine ──────────────────
// Student sees all their own applications
// Used by: Application Tracker page
//
// ResearchConnect context:
// Mansora goes to her Application Tracker and sees:
// - Dr. Sarah Chen (UCL) — Pending — Applied 3 days ago
// - Prof. Ahmed Hassan (Manchester) — Accepted — 
// - Dr. James Wilson (Oxford) — Declined
router.get('/mine', protect, async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user._id
    })
      .populate('supervisor', 'username university department profilePhoto availability responseRate')
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: GET /api/applications/received ──────────────
// Supervisor sees all applications they have received
// Used by: Supervisor's dashboard / notifications
//
// ResearchConnect context:
// Dr. Sarah Chen opens her dashboard and sees all students
// who applied to work with her. She can filter by status.
router.get('/received', protect, async (req, res) => {
  try {
    // Only supervisors can see received applications
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({
        message: 'Only supervisors can view received applications'
      });
    }

    const applications = await Application.find({
      supervisor: req.user._id
    })
      .populate('student', 'username university department profilePhoto skills researchInterests impactScore')
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 4: PUT /api/applications/:id ───────────────────
// Supervisor responds to an application — accept or decline
// Used by: Application detail view — Accept/Decline buttons
//
// ResearchConnect context:
// Dr. Sarah Chen reads Mansora's application. She clicks
// "Accept" and writes a note: "Great background — let's
// schedule a call." Mansora gets a notification immediately.
//
// This route also:
// - Updates supervisor's response rate (Cold Email Killer)
// - Triggers Ghosting Protection timer reset
// - Creates a notification for the student
router.put('/:id', protect, async (req, res) => {
  try {
    // Only supervisors can respond
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({
        message: 'Only supervisors can respond to applications'
      });
    }

    const { status, supervisorNote } = req.body;

    // Validate status
    const validStatuses = ['accepted', 'declined', 'reviewing'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Status must be accepted, declined, or reviewing'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Make sure this supervisor owns this application
    if (application.supervisor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorised — this is not your application to respond to'
      });
    }

    // Update the application
    application.status = status;
    application.supervisorNote = supervisorNote || '';
    application.respondedAt = new Date();
    await application.save();

    // Update supervisor response stats for Cold Email Killer feature
    // Count how many they have responded to
    const respondedCount = await Application.countDocuments({
      supervisor: req.user._id,
      respondedAt: { $exists: true }
    });

    const totalCount = await Application.countDocuments({
      supervisor: req.user._id
    });

    // Calculate response rate as a percentage
    const responseRate = Math.round((respondedCount / totalCount) * 100);

    await User.findByIdAndUpdate(req.user._id, {
      applicationsResponded: respondedCount,
      responseRate
    });

    await application.populate('student', 'username university profilePhoto');
    await application.populate('supervisor', 'username university profilePhoto');

    res.status(200).json({
      message: `Application ${status}`,
      application
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 5: PUT /api/applications/:id/withdraw ──────────
// Student withdraws their application
// Used by: Application Tracker — Withdraw button
router.put('/:id/withdraw', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check this student owns this application
    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorised — this is not your application'
      });
    }

    // Can only withdraw pending applications
    if (application.status !== 'pending') {
      return res.status(400).json({
        message: 'Can only withdraw pending applications'
      });
    }

    application.status = 'withdrawn';
    await application.save();

    res.status(200).json({
      message: 'Application withdrawn',
      application
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;