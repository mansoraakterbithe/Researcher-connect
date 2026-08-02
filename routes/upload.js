// ============================================================
// FILE: routes/upload.js
// File upload routes
//
// ResearchConnect context:
// Used when students upload documents in the Apply modal:
// - CV / Resume
// - Research Statement
// - Academic Transcript
// - Writing Sample
// - Reference Letter
//
// Also used when supervisors upload:
// - Offer letters
// - Project briefs
// - Funding confirmation letters
// ============================================================

const express = require('express');
const router = express.Router();
const path = require('path');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ── ROUTE 1: POST /api/upload/document ───────────────────
// Upload a single document
// Used by: Apply modal document upload rows
//
// How it works:
// 1. Frontend sends the file as multipart/form-data
// 2. multer saves it to the uploads/ folder
// 3. We return the file URL so it can be saved in the application
//
// ResearchConnect context:
// Mansora uploads her CV. It gets saved as
// "uploads/1722545374829-mansora-cv.pdf"
// The URL "/api/upload/files/1722545374829-mansora-cv.pdf"
// gets saved in her application document list.
// Dr. Sarah can then download it by clicking the link.
router.post('/document', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Build the URL where this file can be accessed
    const fileUrl = `/api/upload/files/${req.file.filename}`;

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        name: req.body.name || req.file.originalname,
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: POST /api/upload/profile-photo ──────────────
// Upload a profile or cover photo
// Used by: Edit Profile page photo upload
router.post('/profile-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    const photoUrl = `/api/upload/files/${req.file.filename}`;

    res.status(201).json({
      message: 'Photo uploaded successfully',
      url: photoUrl
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: GET /api/upload/files/:filename ──────────────
// Serve uploaded files
// Used by: Anywhere a file URL appears — download link
router.get('/files/:filename', protect, (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../uploads', filename);

  // Send the file — Express handles the download
  res.sendFile(filepath, err => {
    if (err) {
      res.status(404).json({ message: 'File not found' });
    }
  });
});

module.exports = router;