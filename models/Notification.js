// ============================================================
// FILE: models/Notification.js
// A Notification is an alert sent to a user when something
// happens on ResearchConnect that involves them.
//
// ResearchConnect context:
// When Dr. Sarah Chen accepts Mansora's application,
// Mansora gets a notification: "Your application was accepted"
// When Prof. Hassan likes Mansora's paper post,
// she gets a notification: "Prof. Hassan liked your post"
// When a new supervisor matching 90%+ is found,
// the student gets a notification: "New match found"
// ============================================================

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // What kind of notification is this?
    type: {
      type: String,
      enum: [
        'application_received',   // supervisor got a new application
        'application_accepted',   // student's application was accepted
        'application_declined',   // student's application was declined
        'connection_request',     // someone wants to connect
        'connection_accepted',    // your connection was accepted
        'post_like',             // someone liked your post
        'post_comment',          // someone commented on your post
        'new_match',             // new supervisor match found
        'endorsement',           // someone endorsed your skill
        'message',               // new message received
        'system',                // platform announcement
        'ghosting_warning'       // Ghosting Protection feature
      ],
      required: true
    },

    // Notification headline
    title: { type: String, required: true },

    // Full notification text
    body: { type: String, required: true },

    // Has the recipient read this?
    read: { type: Boolean, default: false },

    // Where clicking the notification takes the user
    // e.g. '/applications' or '/profile/6a6e5e37...'
    actionPath: { type: String, default: '' },

    // The user who triggered this notification
    // e.g. Prof. Hassan who liked the post
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Related document ID
    // e.g. the application ID or post ID
    relatedId: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

// Index for fast retrieval of a user's notifications
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);