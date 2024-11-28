import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import dotenv from 'dotenv';

dotenv.config();

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    console.log('File upload started:', file.originalname); // Debugging
    return {
      bucketName: 'videos', // The bucket name
      filename: `video_${Date.now()}_${file.originalname}`,
    };
  },
});

storage.on('connection', (db) => {
  console.log('Connected to GridFS'); // Debugging
});

storage.on('error', (err) => {
  console.error('Storage error:', err); // Debugging
});

const upload = multer({ storage });

export default upload;

