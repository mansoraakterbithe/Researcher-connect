// ============================================================
// FILE: middleware/adminAuth.js
// Admin authentication middleware
//
// ResearchConnect context:
// Only admin users can verify supervisors and manage the platform.
// Admin is set by adding isAdmin: true to a user in MongoDB directly.
// There is no signup for admin — you set it manually in the database.
// ============================================================

const adminAuth = (req, res, next) => {
  // req.user is set by the protect middleware
  // This middleware must always run AFTER protect
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      message: 'Admin access required'
    });
  }
  next();
};

module.exports = { adminAuth };