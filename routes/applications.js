const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { validateApplication } = require('../middleware/validate');
const { sendApplicationEmail } = require('../utils/email');

// ── ROUTE 1: POST /api/applications ──────────────────────
// Student submits application to supervisor
router.post('/', protect, validateApplication, async (req, res) => {
  try {
    if (req.user.role === 'supervisor') {
      return res.status(403).json({
        message: 'Supervisors cannot apply to other supervisors'
      });
    }

    const { supervisorId, why, background, topic, funding } = req.body;

    const supervisor = await User.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    if (supervisor.role !== 'supervisor') {
      return res.status(400).json({
        message: 'You can only apply to verified supervisors'
      });
    }

    const existingApplication = await Application.findOne({
      student: req.user._id,
      supervisor: supervisorId
    });

    if (existingApplication) {
      return res.status(400).json({
        message: 'You have already applied to this supervisor'
      });
    }

    const application = await Application.create({
      student: req.user._id,
      supervisor: supervisorId,
      why,
      background,
      topic,
      funding
    });

    // Update supervisor received count — Cold Email Killer
    await User.findByIdAndUpdate(supervisorId, {
      $inc: { applicationsReceived: 1 }
    });

    // Notify supervisor
    await Notification.create({
      recipient: supervisorId,
      type: 'application_received',
      title: `New application from ${req.user.username}`,
      body: `${req.user.username} from ${req.user.university || 'ResearchConnect'} has applied to work with you. Topic: ${topic || 'Not specified'}`,
      actionPath: '/applications/received',
      triggeredBy: req.user._id,
      relatedId: application._id.toString()
    });

    await application.populate('student', 'username university profilePhoto');
    await application.populate('supervisor', 'username university profilePhoto');

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });

  } catch (error) {
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
router.get('/mine', protect, async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user._id
    })
      .populate('supervisor', 'username university department profilePhoto availability responseRate isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: GET /api/applications/received ──────────────
// Supervisor sees applications they have received
router.get('/received', protect, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({
        message: 'Only supervisors can view received applications'
      });
    }

    const applications = await Application.find({
      supervisor: req.user._id
    })
      .populate('student', 'username university department profilePhoto skills researchInterests impactScore karmaScore')
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 4: GET /api/applications/:id ───────────────────
// Get single application detail
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'username university profilePhoto skills researchInterests')
      .populate('supervisor', 'username university profilePhoto availability');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const isStudent = application.student._id.toString() === req.user._id.toString();
    const isSupervisor = application.supervisor._id.toString() === req.user._id.toString();

    if (!isStudent && !isSupervisor) {
      return res.status(403).json({ message: 'Not authorised' });
    }

    res.status(200).json({ application });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 5: PUT /api/applications/:id ───────────────────
// Supervisor responds — accept, decline, or reviewing
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({
        message: 'Only supervisors can respond to applications'
      });
    }

    const { status, supervisorNote } = req.body;

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

    if (application.supervisor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorised — this is not your application to respond to'
      });
    }

    application.status = status;
    application.supervisorNote = supervisorNote || '';
    application.respondedAt = new Date();
    await application.save();

    // Update supervisor response rate — Cold Email Killer feature
    const respondedCount = await Application.countDocuments({
      supervisor: req.user._id,
      respondedAt: { $exists: true }
    });

    const totalCount = await Application.countDocuments({
      supervisor: req.user._id
    });

    const responseRate = Math.round((respondedCount / totalCount) * 100);

    await User.findByIdAndUpdate(req.user._id, {
      applicationsResponded: respondedCount,
      responseRate
    });

    // Notify student
    const notificationTitle = status === 'accepted'
      ? `🎉 ${req.user.username} accepted your application`
      : status === 'declined'
      ? `Update on your application to ${req.user.username}`
      : `${req.user.username} is reviewing your application`;

    await Notification.create({
      recipient: application.student,
      type: status === 'accepted' ? 'application_accepted' : 'application_declined',
      title: notificationTitle,
      body: supervisorNote || `Your application status has been updated to: ${status}`,
      actionPath: '/applications',
      triggeredBy: req.user._id,
      relatedId: application._id.toString()
    });

    // Send email to student
    try {
      const studentUser = await User.findById(application.student);
      if (studentUser) {
        await sendApplicationEmail(
          studentUser.email,
          studentUser.username,
          status,
          req.user.username
        );
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError.message);
    }

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

// ── ROUTE 6: PUT /api/applications/:id/withdraw ──────────
// Student withdraws their application
router.put('/:id/withdraw', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorised — this is not your application'
      });
    }

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

// ── ROUTE 7: POST /api/applications/:id/documents ────────
// Add uploaded document to an application
router.post('/:id/documents', protect, async (req, res) => {
  try {
    const { name, filename, url, size, mimeType } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'Document URL is required' });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorised — this is not your application'
      });
    }

    application.documents.push({ name, filename, url, size, mimeType });
    await application.save();

    res.status(200).json({
      message: 'Document added to application',
      documents: application.documents
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 8: PUT /api/applications/:id/outcome ───────────
// Log collaboration outcome — Feature W7
router.put('/:id/outcome', protect, async (req, res) => {
  try {
    const { outcome } = req.body;

    const validOutcomes = ['paper', 'grant', 'phd_placement', 'ongoing', 'none'];
    if (!validOutcomes.includes(outcome)) {
      return res.status(400).json({
        message: 'Outcome must be: paper, grant, phd_placement, ongoing, or none'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const isStudent = application.student.toString() === req.user._id.toString();
    const isSupervisor = application.supervisor.toString() === req.user._id.toString();

    if (!isStudent && !isSupervisor) {
      return res.status(403).json({ message: 'Not authorised' });
    }

    application.outcome = outcome;
    application.outcomeLoggedAt = new Date();
    await application.save();

    // Award karma for logging outcome
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { karmaScore: 5 }
    });

    res.status(200).json({
      message: 'Collaboration outcome logged',
      application
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;