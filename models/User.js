const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // ── BASIC INFO ─────────────────────────────────────────
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },

    // ── ROLE ───────────────────────────────────────────────
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
    profilePhoto: { type: String, default: '' },
    coverPhoto: { type: String, default: '' },

    // ── RESEARCH INFO ──────────────────────────────────────
    skills: { type: [String], default: [] },
    researchInterests: { type: [String], default: [] },

    // ── STATUS ─────────────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'passive', 'closed'],
      default: 'active'
    },
    remote: { type: Boolean, default: true },

    // ── OPEN TO ────────────────────────────────────────────
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
    karmaScore: { type: Number, default: 0 },
    applicationsReceived: { type: Number, default: 0 },
    applicationsResponded: { type: Number, default: 0 },
    responseRate: { type: Number, default: 100 },
    impactScore: { type: Number, default: 0 },
    matchScoreCache: { type: Map, of: Number, default: {} },

    // ── ACCOUNT ────────────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    isAdmin: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);