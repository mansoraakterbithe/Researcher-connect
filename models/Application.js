// ============================================================
// FILE: models/Application.js
// An Application is when a student applies to work with
// a supervisor on ResearchConnect.
//
// ResearchConnect context:
// Mansora fills in the "Apply to Work With" modal on
// Dr. Sarah Chen's profile. She writes why she wants to
// work with her, uploads her CV, selects her funding need.
// That creates one Application document in MongoDB.
// Dr. Sarah Chen sees it in her dashboard and can
// accept, decline, or request more information.
// ============================================================

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String },       // e.g. "CV", "Research Statement"
  filename: { type: String },   // original filename
  url: { type: String },        // where the file is stored
  uploadedAt: { type: Date, default: Date.now }
});

const applicationSchema = new mongoose.Schema(
  {
    // ── WHO IS APPLYING ───────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // ── WHO THEY ARE APPLYING TO ──────────────────────────
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // ── APPLICATION CONTENT ───────────────────────────────
    // Why do you want to work with this supervisor?
    why: { type: String, required: true },

    // What is your research background?
    background: { type: String, required: true },

    // What research topic do you want to work on?
    topic: { type: String, default: '' },

    // What is your funding situation?
    funding: {
      type: String,
      enum: ['self', 'partial', 'full', 'open', ''],
      default: ''
    },

    // ── DOCUMENTS ─────────────────────────────────────────
    // Files the student uploaded with their application
    // CV, Research Statement, Transcript etc.
    documents: [documentSchema],

    // ── STATUS ────────────────────────────────────────────
    // What stage is this application at?
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'withdrawn', 'reviewing'],
      default: 'pending'
    },

    // ── SUPERVISOR RESPONSE ───────────────────────────────
    // Message from supervisor when they respond
    supervisorNote: { type: String, default: '' },

    // When did the supervisor respond?
    // Used for Feature W1: Cold Email Killer
    // We track response time to calculate response rate
    respondedAt: { type: Date },

    // ── UNIQUE FEATURES ───────────────────────────────────
    // Feature W3: Ghosting Protection System
    // When was the last reminder sent to supervisor?
    lastReminderSent: { type: Date },

    // How many reminders have been sent?
    reminderCount: { type: Number, default: 0 },

    // Feature W7: Collaboration Outcome Tracker
    // What did this collaboration produce?
    outcome: {
      type: String,
      enum: ['paper', 'grant', 'phd_placement', 'ongoing', 'none', ''],
      default: ''
    },
    outcomeLoggedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

// Prevent a student from applying to the same supervisor twice
// unique: true on a combination of fields
applicationSchema.index({ student: 1, supervisor: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);