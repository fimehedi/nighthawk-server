import multer from 'multer';
import path from 'path';

// Memory storage for chunks - we'll handle file writing manually
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.skp', '.zip', '.png', '.jpeg', '.jpg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`), false);
  }
};

// Configure multer for chunk uploads
const chunkUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per chunk (adjust as needed)
  }
});

export default chunkUpload;
