const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate safe unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedExt = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, sanitizedExt)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    cb(null, `${baseName}-${uniqueSuffix}${sanitizedExt}`);
  },
});

// Configure upload limits and filters
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max limit
  },
});

// @desc    Upload single file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please attach a file to upload.',
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  return res.status(200).json({
    success: true,
    message: 'File uploaded successfully.',
    file: {
      name: req.file.originalname,
      filename: req.file.filename,
      url: fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date(),
    },
  });
});

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please attach at least one file to upload.',
    });
  }

  const uploadedFiles = req.files.map((file) => ({
    name: file.originalname,
    filename: file.filename,
    url: `/uploads/${file.filename}`,
    size: file.size,
    mimetype: file.mimetype,
    uploadedAt: new Date(),
  }));

  return res.status(200).json({
    success: true,
    message: `${uploadedFiles.length} file(s) uploaded successfully.`,
    files: uploadedFiles,
  });
});

module.exports = router;
