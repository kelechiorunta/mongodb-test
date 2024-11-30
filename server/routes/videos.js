import express from 'express';
import User from '../models/User.js';
import Video from '../models/Videos.js';
// import upload from '../upload.js';
import { gfs } from '../db.js'; // Import GridFS configuration
import { GridFSBucket } from 'mongodb';
// import { gridfsBucket } from '../db.js';
import mongoose from 'mongoose';
import { pipeline } from 'stream';
import { promisify } from 'util';
import multer from 'multer';
import { Readable } from 'stream'; // Ensure Readable is imported

const router = express.Router();
const pipelineAsync = promisify(pipeline);

// Configure Multer to handle file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });



// Upload route
router.post('/upload', upload.single('video'), async (req, res) => {
  try {

        // GridFSBucket initialization
    let gridfsBucket;
    if (mongoose.connection.db) {
    gridfsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'videos',
    });
    }

    // Helper function to create a readable stream from a buffer
    const bufferToStream = (buffer) => {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null); // No more data
    return readable;
    };
    // Validate request
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    // Ensure GridFSBucket is initialized
    if (!gridfsBucket) {
      return res.status(500).json({ error: 'GridFSBucket not initialized' });
    }

    // Create an upload stream with GridFSBucket
    const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype, // Set content type for the file
    });

    // const kelechi = await User.findOne({email: 'kelechiorunta1@gmail.com'})
    const kelechi = await User.findOne({email: 'kelechiorunta1@gmail.com'});
    if (!kelechi) {
        return res.status(400).json({error: "No such user"});
    }

    const existingVideo = await gridfsBucket.find({_id: kelechi.videoId}).next();

    if (existingVideo) {
        console.log(existingVideo)
        // res.status(400).json({error: "File already exists"})
        await gridfsBucket.delete(new mongoose.Types.ObjectId(kelechi.videoId))
    }
    // else{
            // Convert the buffer into a readable stream and pipe it to GridFS
        const readableStream = bufferToStream(req.file.buffer);
        await pipelineAsync(readableStream, uploadStream);


        //Find user called kelechi
        kelechi.videoId = uploadStream.id;
        await kelechi.save();
        // Return success response with the file ID
        res.status(201).json({
        message: 'Upload successful',
        fileId: kelechi.videoId//uploadStream.id,
        });
    // }
    
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
  
// Use gfs and gridfsBucket for GridFS operations
// const gridfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'videos' });

router.get('/videos', async (req, res) => {
    try {
    //   const videoId = req.params.id;
  
      if (!req.headers.range) {
        return res.status(416).send('Requires Range header');
      }
  
      const range = req.headers.range; // e.g., "bytes=0-"
      const start = Number(range.replace(/\D/g, ''));
  
      // Initialize GridFSBucket
      const gridfsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'videos',
      });
      
      const kelechi = await User.findOne({email: 'kelechiorunta1@gmail.com'})

      if (!kelechi) {
        return res.status(400).json({message: "User does not exist"})
      }
      
      // Fetch the file from GridFS
      const file = await gridfsBucket.find({ _id: kelechi.videoId }).next();
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
  
      if (!file.contentType.startsWith('video/')) {
        return res.status(400).json({ error: 'File is not a video' });
      }
  
      // Calculate video size and range
      const videoSize = file.length;
      const CHUNK_SIZE = 10 ** 6; // 1MB
      const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
      const contentLength = end - start + 1;
  
      // Set response headers
      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': file.contentType,
      });
  
      // Stream the video
      const readStream = gridfsBucket.openDownloadStream(file._id, {
        start,
        end: end + 1, // `end` is inclusive, so we need to go one byte beyond
      });
  
      readStream.pipe(res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  

export default router; 
