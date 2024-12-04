// import multer from 'multer';
// import { GridFsStorage } from 'multer-gridfs-storage';
// import dotenv from 'dotenv';

// dotenv.config();

// const storage = new GridFsStorage({
//   url: process.env.MONGO_URI,
//   options: { useNewUrlParser: true, useUnifiedTopology: true },
//   file: (req, file) => {
//     console.log('File upload started:', file.originalname); // Debugging
//     return {
//       bucketName: 'videos', // The bucket name
//       filename: `video_${Date.now()}_${file.originalname}`,
//     };
//   },
// });

// storage.on('connection', (db) => {
//   console.log('Connected to GridFS'); // Debugging
// });

// storage.on('error', (err) => {
//   console.error('Storage error:', err); // Debugging
// });

// const upload = multer({ storage });

// export default upload;

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Directory for storing local files
const LOCAL_UPLOAD_DIR = path.resolve('public/images');

// Ensure the directory exists
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, LOCAL_UPLOAD_DIR); // Save file to local directory
  },
  filename: function (req, file, cb) {
    // Generate a unique filename
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Multer instance with memory buffer
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 5MB size limit
});

export default upload;
