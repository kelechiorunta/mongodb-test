import express from 'express';
import User from '../models/User.js';
import Video from '../models/Videos.js';
// import upload from '../upload.js';
import { gfs } from '../db.js'; // Import GridFS configuration
import { GridFSBucket } from 'mongodb';
import { gridfsBucket } from '../db.js';
import mongoose from 'mongoose';
import { pipeline } from 'stream';
import { promisify } from 'util';
import multer from 'multer';

const router = express.Router();

// Configure Multer to handle fields
const storage = multer.memoryStorage(); // Use memory storage to manage files in memory
const upload = multer({ storage });

const pipelineAsync = promisify(pipeline);

router.post('/upload', upload.single('video'), async (req, res) => {

    // Validate request
    if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

  const bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'videos',
  });
 
  const uploadStream = bucket.openUploadStream(req.body.filename);
  try {
    console.log(req.body)
    await pipelineAsync(req, uploadStream);
    const video = new Video({
        videoId: uploadStream.id, // GridFS file ID
      });
      await video.save(); 
    res.status(201).json({ message: 'Upload successful', fileId: uploadStream.id });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload route
// router.post('/upload', upload.single('video'), async (req, res) => {
//     console.log('Request Body:', req.body); // Debugging
//     console.log('Uploaded File:', req.file); // Debugging
  
//     try {
//       // Validate file upload
//       if (!req.file || !req.file.id) {
//         console.error('File upload failed, req.file is undefined');
//         return res.status(400).json({ error: 'File upload failed.' });
//       }
  
//       // Create a new video entry
//       const video = new Video({
//         videoId: req.file.id, // GridFS file ID
//       });
  
//       await video.save();
  
//       res.status(201).json({
//         message: 'Video uploaded successfully',
//         video,
//         fileId: req.file.id, // Return GridFS file ID
//       });
//     } catch (err) {
//       console.error('Error during file upload:', err);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

// router.get('/videos/:id', async (req, res) => {
//     try {
//       const videoId = req.params.id;
  
//       // Find the file in GridFS
//       gfs.files.findOne({ _id: new mongoose.Types.ObjectId(videoId) }, (err, file) => {
//         if (!file || file.length === 0) {
//           return res.status(404).json({ error: 'No file found' });
//         }
  
//         // Check if the file is a video
//         if (file.contentType.startsWith('video/')) {
//           const range = req.headers.range;
  
//           if (!range) {
//             return res.status(416).send('Requires Range header');
//           }
  
//           const videoSize = file.length;
//           const CHUNK_SIZE = 10 ** 6; // 1MB
//           const start = Number(range.replace(/\D/g, ''));
//           const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
//           const contentLength = end - start + 1;
  
//           res.writeHead(206, {
//             'Content-Range': `bytes ${start}-${end}/${videoSize}`,
//             'Accept-Ranges': 'bytes',
//             'Content-Length': contentLength,
//             'Content-Type': file.contentType,
//           });
  
//           const readStream = gridfsBucket.openDownloadStream(file._id, {
//             start,
//             end: end + 1,
//           });
  
//           readStream.pipe(res);
//         } else {
//           res.status(400).json({ error: 'File is not a video' });
//         }
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });
  
router.get('/videos/:id', async (req, res) => {
    try {
      const videoId = req.params.id;
  
      // Find the file in GridFS
      gfs.files.findOne({ _id: new mongoose.Types.ObjectId(videoId) }, (err, file) => {
        if (!file || file.length === 0) {
          return res.status(404).json({ error: 'No file found' });
        }
  
        if (file.contentType.startsWith('video/')) {
          const range = req.headers.range;
  
          if (!range) {
            return res.status(416).send('Requires Range header');
          }
  
          const videoSize = file.length;
          const CHUNK_SIZE = 10 ** 6; // 1MB
          const start = Number(range.replace(/\D/g, ''));
          const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
          const contentLength = end - start + 1;
  
          res.set({
            // 'Access-Control-Allow-Origin': '*', // Allow all origins
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': file.contentType,
          });
  
          const readStream = gridfsBucket.openDownloadStream(file._id, {
            start,
            end: end + 1,
          });
  
          readStream.pipe(res);
        } else {
          res.status(400).json({ error: 'File is not a video' });
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

export default router; 
