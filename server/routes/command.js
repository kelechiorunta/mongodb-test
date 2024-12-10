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
// import upload from '../upload.js';
import { authenticateToken } from '../middleware.js';
import sharp from 'sharp';
import NodeCache from 'node-cache';

const sipRouter = express.Router();
const pipelineAsync = promisify(pipeline);

// Set up Multer for file uploads
// const upload = multer({
//   dest: path.resolve('public/images'), // Upload directory
//   //limits: { fileSize: 50 * 1024 * 1024 }, // Limit files to 5MB
// });

const storage = multer.memoryStorage();
const upload = multer({ storage });

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // Cache for 1 hour

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

// sipRouter.post('/createPlaceholder/:email', upload.single('picture'), async (req, res) => {
//     try {
//       // Ensure connection to GridFS bucket
//       const gfs = new GridFSBucket(mongoose.connection.db, {
//         bucketName: 'pictures',
//       });
  
//       const currentUser = await User.findOne({ email: req.params.email });
//       if (!currentUser) {
//         return res.status(400).json({ error: 'No such user' });
//       }
  
//       // Delete existing images in GridFS
//       if (currentUser.pictureId) await gfs.delete(new ObjectId(currentUser.pictureId));
//       if (currentUser.placeholderId) await gfs.delete(new ObjectId(currentUser.placeholderId));
  
//       // Uploaded file details
//       const { path: localFilePath, originalname, mimetype } = req.file;
  
//       // Save the original image to GridFS
//       const fullImageWritableStream = gfs.openUploadStream(originalname, {
//         contentType: mimetype,
//       });
//       const fullImageReadableStream = fs.createReadStream(localFilePath);
//       await pipelineAsync(fullImageReadableStream, fullImageWritableStream);
  
//       // Directory for storing local files
//       const LOCAL_UPLOAD_DIR = path.resolve('public/images');
//       // Save the placeholder image to local filesystem
//       const placeholderFilePath = path.resolve(
//         LOCAL_UPLOAD_DIR,
//         `${path.basename(originalname, path.extname(originalname))}-small${path.extname(originalname)}`
//       );
  
//       const command = `sips -Z 20 ${localFilePath} --out ${placeholderFilePath}`;
//       await new Promise((resolve, reject) => {
//         exec(command, (error, stdout, stderr) => {
//           if (error) return reject(new Error('Failed to create placeholder image.'));
//           resolve();
//         });
//       });
  
//       // Save the placeholder image to GridFS
//       const placeholderBuffer = fs.readFileSync(placeholderFilePath);
//       const placeholderWritableStream = gfs.openUploadStream(
//         `${path.basename(originalname, path.extname(originalname))}-small`,
//         { contentType: mimetype }
//       );
//       const placeholderReadableStream = new Readable();
//       placeholderReadableStream.push(placeholderBuffer);
//       placeholderReadableStream.push(null);
//       await pipelineAsync(placeholderReadableStream, placeholderWritableStream);
  
//       // Update the user's image details in the database
//       currentUser.pictureId = fullImageWritableStream.id;
//       currentUser.placeholderId = placeholderWritableStream.id;
//       await currentUser.save();
  
//       // Clean up local files
//       fs.unlinkSync(localFilePath);
//       fs.unlinkSync(placeholderFilePath);
  
//       res.status(201).json({
//         message: 'Upload successful',
//         pictureId: fullImageWritableStream.id,
//         placeholderId: placeholderWritableStream.id,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Error processing the image' });
//     }
//   });


//CURRENT WORKING CODE WITHOUT CACHE
  
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
      const { buffer, originalname, mimetype } = req.file;
  
      // Save the full image to GridFS
      const fullImageWritableStream = gfs.openUploadStream(originalname, {
        contentType: mimetype,
      });
      const fullImageReadableStream = new Readable();
      fullImageReadableStream.push(buffer);
      fullImageReadableStream.push(null);
      await pipelineAsync(fullImageReadableStream, fullImageWritableStream);
  
      // Generate placeholder image (resize and optimize with sharp)
      const placeholderBuffer = await sharp(buffer)
        .resize(20) // Resize to a smaller width for placeholder
        .toBuffer();
  
      // Save the placeholder image to GridFS
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

  sipRouter.post('/profile/:email', upload.single('picture'), async (req, res) => {
    try {
      // Ensure connection to GridFS bucket
      const gfs = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'profilePics',
      });
  
      const currentUser = await User.findOne({ email: req.params.email });
      if (!currentUser) {
        return res.status(400).json({ error: 'No such user' });
      }
  
      // Delete existing images in GridFS
      if (currentUser.profilePicId) await gfs.delete(new ObjectId(currentUser.profilePicId));
      if (currentUser.profilePlaceholderId) await gfs.delete(new ObjectId(currentUser.profilePlaceholderId));
  
      // Uploaded file details
      const { buffer, originalname, mimetype } = req.file;
  
      // Save the full image to GridFS
      const fullImageWritableStream = gfs.openUploadStream(originalname, {
        contentType: mimetype,
      });
      const fullImageReadableStream = new Readable();
      fullImageReadableStream.push(buffer);
      fullImageReadableStream.push(null);
      await pipelineAsync(fullImageReadableStream, fullImageWritableStream);
  
      // Generate placeholder image (resize and optimize with sharp)
      const placeholderBuffer = await sharp(buffer)
        .resize(20) // Resize to a smaller width for placeholder
        .toBuffer();
  
      // Save the placeholder image to GridFS
      const placeholderWritableStream = gfs.openUploadStream(
        `${path.basename(originalname, path.extname(originalname))}-small`,
        { contentType: mimetype }
      );
      const placeholderReadableStream = new Readable();
      placeholderReadableStream.push(placeholderBuffer);
      placeholderReadableStream.push(null);
      await pipelineAsync(placeholderReadableStream, placeholderWritableStream);
  
      // Update the user's image details in the database
      currentUser.profilePicId = fullImageWritableStream.id;
      currentUser.profilePlaceholderId = placeholderWritableStream.id;
      await currentUser.save();
  
      res.status(201).json({
        message: 'Upload successful',
        profilePicId: fullImageWritableStream.id,
        profilePlaceholderId: placeholderWritableStream.id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error processing the image' });
    }
  });

  sipRouter.get('/profilePlaceholderPic/:name', async (req, res) => {
    try {
      // Initialize GridFSBucket
      const gridfsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'profilePics',
      });
  
      // Find the current user
      const currentUser = await User.findOne({ username: req.params.name });
  
      if (!currentUser) {
        return res.status(400).json({ message: "User does not exist" });
      }
  
      if (!currentUser.profilePlaceholderId) {
        return res.status(404).json({ message: "Placeholder not found" });
      }
  
      // Fetch the file from GridFS
      const file = await gridfsBucket.find({ _id: currentUser.profilePlaceholderId }).next();
      if (!file) {
        return res.status(404).json({ message: "Picture not found" });
      }

      console.log('CURRENTPIC', file)
  
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

  sipRouter.get('/profilePic/:name', async (req, res) => {
    try {
      // Initialize GridFSBucket
      const gridfsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'profilePics',
      });
  
      // Find the current user
      const currentUser = await User.findOne({ username: req.params.name });
  
      if (!currentUser) {
        return res.status(400).json({ message: "User does not exist" });
      }
  
      if (!currentUser.profilePicId) {
        return res.status(404).json({ message: "Placeholder not found" });
      }
  
      // Fetch the file from GridFS
      const file = await gridfsBucket.find({ _id: currentUser.profilePicId }).next();
      if (!file) {
        return res.status(404).json({ message: "Picture not found" });
      }

      console.log('CURRENTPIC', file)
  
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

  sipRouter.post('/createProperty/:name', upload.single('property'), async (req, res) => {
    try {
        const gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'properties' });

        // Find the user by email
        const currentUser = await User.findOne({ username: req.params.name });
        if (!currentUser) {
            return res.status(400).json({ error: 'No user found with this email' });
        }

        // Check if the collections already have three entries
        if (
            currentUser.propertyPlaceholderCollections.length >= 3 ||
            currentUser.propertyPictureCollections.length >= 3
        ) {
            return res.status(400).json({ error: 'You cannot add more than three property pictures or placeholders.' });
        }

        const { buffer, originalname, mimetype } = req.file;

        // Save the full image to GridFS
        const fullImageStream = gfs.openUploadStream(originalname, { contentType: mimetype });
        const fullImageReadable = new Readable();
        fullImageReadable.push(buffer);
        fullImageReadable.push(null);
        await pipelineAsync(fullImageReadable, fullImageStream);

        // Generate a placeholder image (resize and optimize with sharp)
        const placeholderBuffer = await sharp(buffer)
            .resize(100) // Resize to a smaller width for placeholder
            .toBuffer();

        // Save the placeholder image to GridFS
        const placeholderStream = gfs.openUploadStream(
            `${path.basename(originalname, path.extname(originalname))}-placeholder`,
            { contentType: mimetype }
        );
        const placeholderReadable = new Readable();
        placeholderReadable.push(placeholderBuffer);
        placeholderReadable.push(null);
        await pipelineAsync(placeholderReadable, placeholderStream);

        // Add the new IDs to the user's collections
        currentUser.propertyPictureCollections.push(fullImageStream.id);
        currentUser.propertyPlaceholderCollections.push(placeholderStream.id);
        await currentUser.save();

        res.status(201).json({
            message: 'Upload successful',
            pictureId: fullImageStream.id,
            placeholderId: placeholderStream.id,
        });
    } catch (error) {
        console.error('Error uploading property picture and placeholder:', error);
        res.status(500).json({ message: 'Error processing the image' });
    }
});

sipRouter.get('/propertyPlaceholder/:name/:no', async (req, res) => {
    try {
        const gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'properties' });

        // Find the user by email
        const currentUser = await User.findOne({ username: req.params.name });
        if (!currentUser) {
            return res.status(400).json({ error: 'No user found with this email' });
        }

        const index = parseInt(req.params.no, 10);

        // Validate index
        if (isNaN(index) || index < 0 || index >= currentUser.propertyPlaceholderCollections.length) {
            return res.status(400).json({ error: 'Invalid index for property placeholder.' });
        }

        // Retrieve placeholder ID and stream it
        const placeholderId = currentUser.propertyPlaceholderCollections[index];
        const file = await gfs.find({ _id: placeholderId }).next();
        if (!file) {
            return res.status(404).json({ error: 'Property placeholder not found.' });
        }

        res.set({
            'Content-Type': file.contentType || 'image/jpeg',
            'Content-Length': file.length,
        });

        const readStream = gfs.openDownloadStream(placeholderId);
        readStream.pipe(res);
    } catch (error) {
        console.error('Error streaming property placeholder:', error);
        res.status(500).json({ message: 'Error streaming placeholder.' });
    }
});

sipRouter.get('/propertyPicture/:name/:no', async (req, res) => {
    try {
        const gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'properties' });

        // Find the user by email
        const currentUser = await User.findOne({ username: req.params.name});
        if (!currentUser) {
            return res.status(400).json({ error: 'No user found with this email' });
        }

        const index = parseInt(req.params.no, 10);

        // Validate index
        if (isNaN(index) || index < 0 || index >= currentUser.propertyPictureCollections.length) {
            return res.status(400).json({ error: 'Invalid index for property picture.' });
        }

        // Retrieve picture ID and stream it
        const pictureId = currentUser.propertyPictureCollections[index];
        const file = await gfs.find({ _id: pictureId }).next();
        if (!file) {
            return res.status(404).json({ error: 'Property picture not found.' });
        }

        res.set({
            'Content-Type': file.contentType || 'image/jpeg',
            'Content-Length': file.length,
        });

        const readStream = gfs.openDownloadStream(pictureId);
        readStream.pipe(res);
    } catch (error) {
        console.error('Error streaming property picture:', error);
        res.status(500).json({ message: 'Error streaming picture.' });
    }
});

sipRouter.delete('/deleteProperty/:name/:n', async (req, res) => {
    try {
        const gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'properties' });
        const { name, n } = req.params;

        // Find the user by username
        const currentUser = await User.findOne({ username: name });
        if (!currentUser) {
            return res.status(400).json({ error: 'No user found with this username' });
        }

        const index = parseInt(n, 10);

        // Validate index
        if (
            isNaN(index) ||
            index < 0 ||
            index >= currentUser.propertyPlaceholderCollections.length ||
            index >= currentUser.propertyPictureCollections.length
        ) {
            return res.status(400).json({ error: 'Invalid index specified.' });
        }

        // Get the IDs to be deleted
        const placeholderId = currentUser.propertyPlaceholderCollections[index];
        const pictureId = currentUser.propertyPictureCollections[index];

        // Delete files from GridFS
        if (placeholderId) {
            try {
                await gfs.delete(new mongoose.Types.ObjectId(placeholderId));
            } catch (error) {
                console.error(`Failed to delete placeholderId: ${placeholderId}`, error);
            }
        }
        if (pictureId) {
            try {
                await gfs.delete(new mongoose.Types.ObjectId(pictureId));
            } catch (error) {
                console.error(`Failed to delete pictureId: ${pictureId}`, error);
            }
        }

        // Remove the IDs from the user's collections
        currentUser.propertyPlaceholderCollections.splice(index, 1);
        currentUser.propertyPictureCollections.splice(index, 1);

        // Save the updated user document
        await currentUser.save();

        res.status(200).json({
            message: 'Property placeholder and picture deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting property placeholder and picture:', error);
        res.status(500).json({ message: 'Error processing the request' });
    }
});

sipRouter.post('/createPost/:name', async(req, res) => {
    const { content } = req.body;
    const name = req.params.name;
    try{
        if (!content) {
          return res.status(400).json({error: "Invalid Post"})
        }

        const bufferToStream = (bufferString) => {
            const readable = new Readable();
            readable.push(bufferString);
            readable.push(null);
            return readable;
        }

        const fullreadableStream = bufferToStream(content);

        const fullwriteableStream = fs.createWriteStream('post.txt');

        await pipelineAsync(fullreadableStream, fullwriteableStream);
        res.status(201).json({
          message: 'Post Upload Successful',  
        });
    }catch(err){
        console.log("Unable to upload Post");
        return res.status(500).json({error: "Server failure."})
    }
})
  
export default sipRouter;