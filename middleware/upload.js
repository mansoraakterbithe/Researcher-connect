// ============================================================
// FILE: middleware/upload.js
// File upload configuration using multer
//
// ResearchConnect context:
// When a student uploads their CV in the Apply modal,
// this middleware handles the file.
// Files are stored locally for now.
// In production, swap localStorage for Cloudinary.
//
// Allowed files: PDF, Word documents, images
// Max size: 5MB per file
// ============================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it does not exist
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure where and how to store files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store in uploads folder
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp + original name
    // e.g. "1722545374829-mansora-cv.pdf"
    // This prevents files with the same name overwriting each other
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

// Filter — only allow certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    cb(new Error('Only PDF, Word documents and images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

module.exports = upload;