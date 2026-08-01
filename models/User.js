// ============================================================
// FILE: models/User.js
// This defines what a User looks like in MongoDB.
// Think of it as a form with specific fields.
// Every user in the database must match this shape.
// ============================================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // ── BASIC INFO ─────────────────────────────────────────
    username: {
      type: String,
      required: true,   // cannot be empty
      unique: true,     // no two users can have the same username
      trim: true        // removes spaces from start and end
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true   // always saves as lowercase so "Test@gmail.com" == "test@gmail.com"
    },
    password: {
      type: String,
      required: true
      // NEVER stored as plain text — always hashed with bcrypt
    },

    // ── ROLE ───────────────────────────────────────────────
    // enum means: only these exact values are allowed
    role: {
      type: String,
      enum: ['student', 'supervisor', 'researcher'],
      default: 'student'
    },

    // ── PROFILE INFO ───────────────────────────────────────
    bio: { type: String, default: '' },
    university: { type: String, default: '' },
    department: { type: String, default: '' },
    location: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },   // URL to photo
    coverPhoto: { type: String, default: '' },     // URL to cover

    // ── RESEARCH INFO ──────────────────────────────────────
    skills: { type: [String], default: [] },
    researchInterests: { type: [String], default: [] },

    // ── STATUS ─────────────────────────────────────────────
    // active = actively looking, passive = open, closed = not available
    status: {
      type: String,
      enum: ['active', 'passive', 'closed'],
      default: 'active'
    },
    remote: { type: Boolean, default: true },

    // ── OPEN TO ────────────────────────────────────────────
    // What kinds of opportunities is this person open to?
    openTo: {
      collaboration: { type: Boolean, default: true },
      coauthorship: { type: Boolean, default: true },
      phd: { type: Boolean, default: false },
      supervision: { type: Boolean, default: false },
      international: { type: Boolean, default: false }
    },

    // ── STUDENT SPECIFIC ───────────────────────────────────
    seekingSupervisor: { type: Boolean, default: false },
    targetDegree: {
      type: String,
      enum: ['PhD', 'Masters', 'MPhil', 'Postdoc', ''],
      default: ''
    },
    fundingNeeded: { type: String, default: '' },
    availableFrom: { type: String, default: '' },

    // ── SUPERVISOR SPECIFIC ────────────────────────────────
    availability: {
      status: {
        type: String,
        enum: ['open', 'limited', 'closed'],
        default: 'closed'
      },
      fundedSlots: { type: Number, default: 0 },
      scholarshipInfo: { type: String, default: '' },
      requirements: { type: String, default: '' },
      responseTime: { type: String, default: '' },
      deadline: { type: String, default: '' },
      startDate: { type: String, default: '' },
      projectType: { type: String, default: '' },
      levels: { type: [String], default: [] }
    },

    // ── SOCIAL LINKS ───────────────────────────────────────
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
      orcid: { type: String, default: '' }
    },

    // ── NETWORK ────────────────────────────────────────────
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── UNIQUE FEATURES ────────────────────────────────────
    // Feature W5: Research Karma System
    karmaScore: { type: Number, default: 0 },

    // Feature W1: Cold Email Killer — track response rate
    // How many applications has this supervisor responded to?
    applicationsReceived: { type: Number, default: 0 },
    applicationsResponded: { type: Number, default: 0 },
    // Calculated field: applicationsResponded / applicationsReceived * 100
    responseRate: { type: Number, default: 100 },

    // Feature W4: Imposter Syndrome Score
    impactScore: { type: Number, default: 0 },

    // Feature M1: Match Score cache
    // Stores pre-calculated match scores with other users
    // so we don't recalculate every time
    matchScoreCache: { type: Map, of: Number, default: {} },

    // ── ACCOUNT ────────────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    // Supervisors are verified when we confirm their .ac.uk email
    verifiedAt: { type: Date }
  },
  {
    // timestamps: true automatically adds createdAt and updatedAt fields
    // 🍰 Real life: like a timestamp on a receipt — when was this created?
    timestamps: true
  }
);

// ── VIRTUAL FIELD ─────────────────────────────────────────
// A virtual field is calculated on the fly — not stored in database
// 🍰 Real life: your age is calculated from your birthday — not stored separately
userSchema.virtual('papersCount').get(function() {
  // This will be populated from the Post model later
  return 0;
});

module.exports = mongoose.model('User', userSchema);