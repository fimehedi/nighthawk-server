import multer from 'multer';
import path from 'path';

// Memory storage for chunks - we'll handle file writing manually
const storage = multer.memoryStorage();

// File filter to validate file types
// Note: File type validation happens at initialization stage
const fileFilter = (req, file, cb) => {
  // Accept all file types for chunks - validation already done at initialization
  cb(null, true);
};

// Configure multer for chunk uploads
const chunkUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per chunk
  }
});

export default chunkUpload;
