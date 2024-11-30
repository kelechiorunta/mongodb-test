import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb'; // Native GridFSBucket from MongoDB
import gridfsStream from 'gridfs-stream';

let gfs, gridfsBucket;

const connectDB = async (mongoURI) => {
  try {
    const conn = await mongoose.connect(mongoURI);

    console.log('MongoDB Connected');

    // Initialize GridFSBucket once connection is established
    const db = conn.connection.db;
    gridfsBucket = new GridFSBucket(db, { bucketName: 'videos' });

    // Use gridfs-stream for backward compatibility if needed
    
    gfs = gridfsStream(db, mongoose.mongo);
    gfs.collection('videos');

    console.log('GridFS initialized');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export { connectDB, gfs, gridfsBucket };

// import mongoose from 'mongoose';
// import { GridFSBucket } from 'mongodb';

// let gridfsBucket;

// const connectDB = async (mongoURI) => {
//   try {
//     const conn = await mongoose.connect(mongoURI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log('MongoDB Connected');

//     // Initialize GridFSBucket with bucketName 'videos' to match the route
//     gridfsBucket = new GridFSBucket(conn.connection.db, { bucketName: 'videos' });

//     console.log('GridFSBucket initialized');
//   } catch (err) {
//     console.error('MongoDB connection error:', err.message);
//     process.exit(1);
//   }
// };

// export { connectDB, gridfsBucket };
