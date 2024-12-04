import express from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb'
import { pipeline, Readable } from 'stream';
import User from '../models/User.js';
import { promisify } from 'util';
import upload from '../upload.js';

const sipRouter = express.Router();
const pipelineAsync = promisify(pipeline);

// Set up Multer for file uploads
// const upload = multer({
//   dest: path.resolve('public/images'), // Upload directory
//   //limits: { fileSize: 50 * 1024 * 1024 }, // Limit files to 5MB
// });

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// Image upload and placeholder generation endpoint
sipRouter.post('/sipUpload', upload.single('image'), (req, res) => {
  try {
    // Get the uploaded file information
    const uploadedFilePath = req.file.path;
    const uploadedFileName = req.file.originalname;
    const uploadedFileExt = path.extname(uploadedFileName);
    const uploadedFileBaseName = path.basename(uploadedFileName, uploadedFileExt);

    // Define the placeholder file path
    const placeholderFilePath = path.resolve(
      'public/images',
      `${uploadedFileBaseName}-small${uploadedFileExt}`
    );

    // Command to create the placeholder image
    const command = `sips -Z 20 ${uploadedFilePath} --out ${placeholderFilePath}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating placeholder: ${error.message}`);
        return res.status(500).json({ message: 'Failed to create placeholder image.' });
      }

      if (stderr) {
        console.warn(`sips warning: ${stderr}`);
      }

      // Respond with the placeholder file details
      res.status(200).json({
        message: 'Placeholder image created successfully!',
        placeholderPath: `/images/${uploadedFileBaseName}-small${uploadedFileExt}`,
        stdout,
      });
    });
  } catch (err) {
    console.error(`Server error: ${err.message}`);
    res.status(500).json({ message: 'Server error while processing the image.' });
  }
});

// Image upload and placeholder generation endpoint
// sipRouter.post('/createPlaceholder/:email', upload.single('image'), async(req, res) => {
//     try {

//         //Ensure connection to database is secured
//         let gfs;
//         if (mongoose.connection.db){
//             gfs = new GridFSBucket(mongoose.connection.db, {
//                 bucketName: 'pictures'
//             })
//         }

//         //Helper function to create a readable Stream from the image
//         const bufferImageToStream = (buffer) => {
//             const readable = new Readable();
//             readable.push(buffer);
//             readable.push(null)
//             return readable;
//         }

//         const currentUser = await User.findOne({email: req.params.email});
//               if (!currentUser) {
//                   return res.status(400).json({error: "No such user"});
//               }
          
//             const existingPicture = await gfs.find({_id: currentUser.pictureId}).next();
          
//               if (existingPicture) {
//                   console.log(existingPicture)
//                   // res.status(400).json({error: "File already exists"})
//                   await gfs.delete(new ObjectId(currentUser.pictureId))
//               }


//             // Get the uploaded file information
//             const uploadedFilePath = req.file.path;
//             const uploadedFileName = req.file.originalname;
//             const uploadedFileExt = path.extname(uploadedFileName);
//             const uploadedFileBaseName = path.basename(uploadedFileName, uploadedFileExt);
//             const currentUserEmail = req.params?.email

//             // Define the placeholder file path
//             const placeholderFilePath = path.resolve(
//                 'public/images',
//                 `${currentUserEmail}-small${uploadedFileExt}`
//             );
        
//             // Command to create the placeholder image
//             const command = `sips -Z 20 ${uploadedFilePath} --out ${placeholderFilePath}`;
        
//             // Execute the command
//             exec(command, (error, stdout, stderr) => {
//                 if (error) {
//                 console.error(`Error creating placeholder: ${error.message}`);
//                 return res.status(500).json({ message: 'Failed to create placeholder image.' });
//                 }
        
//                 if (stderr) {
//                 console.warn(`sips warning: ${stderr}`);
//                 }
//                 const message = 'Placeholder image created successfully!';
//                 // const placeholderPath = `/images/${req.params.email}-small${uploadedFileExt}`
//                 // stdout,
//                 console.log(message, stdout)
//             })
            
//                 const writeableStream = gfs.openUploadStream(req.file.originalname, {
//                     contentType: req.file.mimetype,
//                 });
//                 const readableStream = bufferImageToStream(req.file.buffer)
//                 await  pipelineAsync(readableStream, writeableStream);
                
//                 //Find currentUser and save video for current User
//                 currentUser.pictureId = writeableStream.id;
//                 await currentUser.save();
//                 // Return success response with the file ID
//                 res.status(201).json({
//                 message: 'Upload successful',
//                 fileId: currentUser.pictureId//uploadStream.id,
//                 });
            
//             } catch (err) {
//             console.error(`Server error: ${err.message}`);
//             res.status(500).json({ message: 'Server error while processing the image.' });
//             }
//   });

// sipRouter.post('/createPlaceholder/:email', upload.single('picture'), async (req, res) => {
//     try {
//       // Ensure connection to database is secured
//       let gfs;
//       if (mongoose.connection.db) {
//         gfs = new GridFSBucket(mongoose.connection.db, {
//           bucketName: 'pictures',
//         });
//       }
  
//       // Helper function to create a readable Stream from the image
//       const bufferImageToStream = (buffer) => {
//         const readable = new Readable();
//         readable.push(buffer);
//         readable.push(null);
//         return readable;
//       };
  
//       const currentUser = await User.findOne({ email: req.params.email });
//       if (!currentUser) {
//         return res.status(400).json({ error: 'No such user' });
//       }
  
//       // Delete existing picture if it exists
//       if (currentUser.pictureId) {
//         await gfs.delete(new ObjectId(currentUser.pictureId));
//       }
  
//       if (currentUser.placeholderId) {
//         await gfs.delete(new ObjectId(currentUser.placeholderId));
//       }
  
//       // Get the uploaded file information
//       const uploadedFilePath = req.file.path;
//       const uploadedFileName = req.file.originalname;
//       const uploadedFileExt = path.extname(uploadedFileName);
//       const uploadedFileBaseName = path.basename(uploadedFileName, uploadedFileExt);
//       const currentUserEmail = req.params.email;
  
//       // Define the placeholder file path
//       const placeholderFilePath = path.resolve(
//         'public/images',
//         `${currentUserEmail}-small${uploadedFileExt}`
//       );

//       // Upload the full-size image to GridFS
//       const fullImageWritableStream = gfs.openUploadStream(req.file.originalname, {
//         contentType: req.file.mimetype,
//       });
//       const fullImageReadableStream = bufferImageToStream(req.file.buffer);
//       await pipelineAsync(fullImageReadableStream, fullImageWritableStream);
//       currentUser.pictureId = fullImageWritableStream.id;
//       await currentUser.save();
//       // Command to create the placeholder image
//       const command = `sips -Z 20 ${uploadedFilePath} --out ${placeholderFilePath}`;
  
//       // Execute the command
//       await new Promise((resolve, reject) => {
//         exec(command, (error, stdout, stderr) => {
//           if (error) {
//             console.error(`Error creating placeholder: ${error.message}`);
//             return reject(new Error('Failed to create placeholder image.'));
//           }
  
//           if (stderr) {
//             console.warn(`sips warning: ${stderr}`);
//           }
  
//           console.log('Placeholder image created successfully!', stdout);
//           resolve();
//         });
//       });

  
//       // Read the placeholder image buffer
//       const placeholderBuffer = fs.readFileSync(placeholderFilePath);
//       const placeholderWritableStream = gfs.openUploadStream(`${uploadedFileBaseName}-small`, {
//         contentType: req.file.mimetype,
//       });
//       const placeholderReadableStream = bufferImageToStream(placeholderBuffer);
//       await pipelineAsync(placeholderReadableStream, placeholderWritableStream);
  
//       // Save the picture and placeholder IDs in the user record
//     //   currentUser.pictureId = fullImageWritableStream.id;
//       currentUser.placeholderId = placeholderWritableStream.id;
//       await currentUser.save();
  
//       // Cleanup the placeholder image file from local storage
//       fs.unlinkSync(placeholderFilePath);
  
//       // Return success response with the file IDs
//       res.status(201).json({
//         message: 'Upload successful',
//         pictureId: fullImageWritableStream.id,
//         placeholderId: placeholderWritableStream.id,
//       });
//     } catch (err) {
//       console.error(`Server error: ${err.message}`);
//       res.status(500).json({ message: 'Server error while processing the image.' });
//     }
//   });

sipRouter.post('/createPlaceholder/:email', upload.single('picture'), async (req, res) => {
    try {
      // Ensure connection to GridFS bucket
      const gfs = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'pictures',
      });
  
      const currentUser = await User.findOne({ email: req.params.email });
      if (!currentUser) {
        return res.status(400).json({ error: 'No such user' });
      }
  
      // Delete existing images in GridFS
      if (currentUser.pictureId) await gfs.delete(new ObjectId(currentUser.pictureId));
      if (currentUser.placeholderId) await gfs.delete(new ObjectId(currentUser.placeholderId));
  
      // Uploaded file details
      const { path: localFilePath, originalname, mimetype } = req.file;
  
      // Save the original image to GridFS
      const fullImageWritableStream = gfs.openUploadStream(originalname, {
        contentType: mimetype,
      });
      const fullImageReadableStream = fs.createReadStream(localFilePath);
      await pipelineAsync(fullImageReadableStream, fullImageWritableStream);
  
      // Directory for storing local files
      const LOCAL_UPLOAD_DIR = path.resolve('public/images');
      // Save the placeholder image to local filesystem
      const placeholderFilePath = path.resolve(
        LOCAL_UPLOAD_DIR,
        `${path.basename(originalname, path.extname(originalname))}-small${path.extname(originalname)}`
      );
  
      const command = `sips -Z 20 ${localFilePath} --out ${placeholderFilePath}`;
      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) return reject(new Error('Failed to create placeholder image.'));
          resolve();
        });
      });
  
      // Save the placeholder image to GridFS
      const placeholderBuffer = fs.readFileSync(placeholderFilePath);
      const placeholderWritableStream = gfs.openUploadStream(
        `${path.basename(originalname, path.extname(originalname))}-small`,
        { contentType: mimetype }
      );
      const placeholderReadableStream = new Readable();
      placeholderReadableStream.push(placeholderBuffer);
      placeholderReadableStream.push(null);
      await pipelineAsync(placeholderReadableStream, placeholderWritableStream);
  
      // Update the user's image details in the database
      currentUser.pictureId = fullImageWritableStream.id;
      currentUser.placeholderId = placeholderWritableStream.id;
      await currentUser.save();
  
      // Clean up local files
      fs.unlinkSync(localFilePath);
      fs.unlinkSync(placeholderFilePath);
  
      res.status(201).json({
        message: 'Upload successful',
        pictureId: fullImageWritableStream.id,
        placeholderId: placeholderWritableStream.id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error processing the image' });
    }
  });
  
  
export default sipRouter;