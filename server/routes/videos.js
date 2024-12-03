import express from 'express';
import User from '../models/User.js';
import Video from '../models/Videos.js';
// import upload from '../upload.js';
import { gfs } from '../db.js'; // Import GridFS configuration
import { GridFSBucket, ObjectId } from 'mongodb';
// import { gridfsBucket } from '../db.js';
import mongoose from 'mongoose';
import { pipeline } from 'stream';
import { promisify } from 'util';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { Readable } from 'stream'; // Ensure Readable is imported
import { authenticateToken } from '../middleware.js';

const router = express.Router();
const pipelineAsync = promisify(pipeline);

// Configure Multer to handle file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/videos/:email', authenticateToken, async (req, res) => {
    try {
      const gridfsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'videos',
      });

      const currentEmail = req.params.email
  
      const range = req.headers.range;
      if (!range) {
        return res.status(416).send('Range header is required');
      }
  
      // Retrieve the user and video file
      const currentUser = await User.findOne({ email: currentEmail });
      if (!currentUser) {
        return res.status(400).json({ message: 'User does not exist' });
      }
  
      const file = await gridfsBucket.find({ _id: currentUser.videoId }).next();
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
  
      // Validate the Range header
      const start = Number(range.replace(/\D/g, ''));
      if (isNaN(start) || start >= file.length) {
        return res.status(416).set({
          'Content-Range': `bytes */${file.length}`,
        }).send('Requested range is not satisfiable');
      }
  
      const CHUNK_SIZE = 10 ** 6; // 1MB
      const end = Math.min(start + CHUNK_SIZE, file.length - 1);
      const contentLength = end - start + 1;
  
      // Set response headers for partial content
      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${file.length}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': file.contentType,
      });
  
      // Stream the video chunk
      const readStream = gridfsBucket.openDownloadStream(file._id, {
        start,
        end: end + 1, // Include the last byte
      });
  
      readStream.pipe(res);
    } catch (err) {
      console.error('Error fetching video:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });  

// Upload route
router.post('/upload', upload.single('video'), authenticateToken, async (req, res) => {
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

    // Current User
    const currentUser = await User.findOne({email: req.user?.email});
    if (!currentUser) {
        return res.status(400).json({error: "No such user"});
    }

    const existingVideo = await gridfsBucket.find({_id: currentUser.videoId}).next();

    if (existingVideo) {
        console.log(existingVideo)
        // res.status(400).json({error: "File already exists"})
        await gridfsBucket.delete(new mongoose.Types.ObjectId(currentUser.videoId))
    }
    // else{
            // Convert the buffer into a readable stream and pipe it to GridFS
        const readableStream = bufferToStream(req.file.buffer);
        await pipelineAsync(readableStream, uploadStream);


        //Find currentUser and save video for current User
        currentUser.videoId = uploadStream.id;
        await currentUser.save();
        // Return success response with the file ID
        res.status(201).json({
        message: 'Upload successful',
        fileId: currentUser.videoId//uploadStream.id,
        });
    // }
    
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

  
router.get('/image', authenticateToken, async(req, res) => {

    try {
    
        if (!req.user) {
          return res.status(404).send("Image not found.");
        }   
            // Return the image URL
            res.status(200).json({ imageUrl: req.user?.picture });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).send("Internal Server Error.");
        }
    });

    router.get('/picture', authenticateToken, async (req, res) => {
        try {
          // Initialize GridFSBucket
          const gridfsBucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: 'pictures',
          });
      
          // Find the current user
          const currentUser = await User.findOne({ email: req.user?.email });
      
          if (!currentUser) {
            return res.status(400).json({ message: "User does not exist" });
          }
      
          if (!currentUser.pictureId) {
            return res.status(404).json({ message: "Picture not found" });
          }
      
          // Fetch the file from GridFS
          const file = await gridfsBucket.find({ _id: currentUser.pictureId }).next();
          if (!file) {
            return res.status(404).json({ message: "Picture not found" });
          }
      
          // Set appropriate headers for the image
          res.set({
            'Content-Type': file.contentType || 'image/jpeg', // Default to JPEG if contentType is not set
            'Content-Length': file.length,
          });
      
          // Stream the picture
          const readStream = gridfsBucket.openDownloadStream(file._id);
          readStream.on('error', (err) => {
            console.error('Error streaming picture:', err);
            res.status(500).json({ error: 'Error streaming picture' });
          });
      
          readStream.pipe(res);
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Server error' });
        }
      });

        // Assuming authenticateToken middleware is correctly implemented
        router.get('/getFile', authenticateToken, async (req, res) => {
            try {
            // Initialize GridFSBucket
            const gfsBucket = new GridFSBucket(mongoose.connection.db, {
                bucketName: 'file',
            });
        
            // Find the current user
            const currentUser = await User.findOne({ email: req.user?.email });
        
            if (!currentUser) {
                return res.status(404).json({ message: "User does not exist" });
            }
        
            // Fetch the file from GridFS
            const file = await gfsBucket.find({ _id: new ObjectId(currentUser.fileId) }).next();
            if (!file) {
                return res.status(404).json({ message: "File not found" });
            }
        
            console.log("File found:", file);
        
            // Set appropriate headers
            res.set({
                'Content-Type': file.contentType || 'application/octet-stream',
                'Content-Length': file.length,
            });
        
            // Stream the file to the client
            const readableStream = gfsBucket.openDownloadStream(file._id);
            readableStream.on('error', (err) => {
                console.error('Stream error:', err);
                return res.status(500).json({ error: "Error while streaming the file" });
            });
        
            readableStream.pipe(res);
            } catch (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: "Failed to stream the file" });
            }
        });

        router.post('/uploadPic', upload.single('picture'), authenticateToken, async (req, res) => {
            try {
                  // GridFSBucket initialization
              let gridfsBucket;
              if (mongoose.connection.db) {
              gridfsBucket = new GridFSBucket(mongoose.connection.db, {
                  bucketName: 'pictures',
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
                return res.status(400).json({ error: 'No picture file uploaded' });
              }
          
              // Ensure GridFSBucket is initialized
              if (!gridfsBucket) {
                return res.status(500).json({ error: 'GridFSBucket not initialized' });
              }
          
              // Create an upload stream with GridFSBucket
              const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
                contentType: req.file.mimetype, // Set content type for the file
              });
          
              // Current User
              const currentUser = await User.findOne({email: req.user?.email});
              if (!currentUser) {
                  return res.status(400).json({error: "No such user"});
              }
          
              const existingPicture = await gridfsBucket.find({_id: currentUser.pictureId}).next();
          
              if (existingPicture) {
                  console.log(existingPicture)
                  // res.status(400).json({error: "File already exists"})
                  await gridfsBucket.delete(new mongoose.Types.ObjectId(currentUser.pictureId))
              }
              // else{
                      // Convert the buffer into a readable stream and pipe it to GridFS
                  const readableStream = bufferToStream(req.file.buffer);
                  await pipelineAsync(readableStream, uploadStream);
          
          
                  //Find currentUser and save video for current User
                  currentUser.pictureId = uploadStream.id;
                  await currentUser.save();
                  // Return success response with the file ID
                  res.status(201).json({
                  message: 'Upload successful',
                  fileId: currentUser.pictureId//uploadStream.id,
                  });
              // }
              
            } catch (err) {
              console.error('Upload failed:', err);
              res.status(500).json({ error: 'Upload failed' });
            }
          });
export default router; 
