import multer from "multer";

const storage = multer.diskStorage();

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});