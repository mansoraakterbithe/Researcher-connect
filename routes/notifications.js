// ============================================================
// FILE: routes/notifications.js
// Notification routes
//
// ResearchConnect context:
// The bell icon in the navbar shows unread count.
// Clicking it opens the Notifications page.
// Notifications are created automatically when things happen
// (application accepted, post liked etc.)
// ============================================================

const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// ── ROUTE 1: GET /api/notifications ──────────────────────
// Get all my notifications
// Used by: Notifications page, bell icon badge count
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    })
      .populate('triggeredBy', 'username profilePhoto role')
      .sort({ createdAt: -1 })
      .limit(50);

    // Count unread separately for the bell badge
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.status(200).json({ notifications, unreadCount });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: PUT /api/notifications/:id/read ─────────────
// Mark one notification as read
// Used by: Clicking a notification
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ notification });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: PUT /api/notifications/read-all ─────────────
// Mark ALL notifications as read
// Used by: "Mark all as read" button
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 4: DELETE /api/notifications/:id ───────────────
// Delete a notification
// Used by: Dismiss button on notification
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;