import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb'; // Native GridFSBucket from MongoDB
import gridfsStream from 'gridfs-stream';
import dotenv from 'dotenv';
import net from 'net';

dotenv.config();
let gfs, gridfsBucket;

const connectDB = async (mongoURI=process.env.MONGO_URI) => {
  try {
    const conn = await mongoose.connect(mongoURI);

    console.log('MongoDB Connected');

    // Initialize GridFSBucket once connection is established
    const db = conn.connection.db;
    gridfsBucket = new GridFSBucket(db, { bucketName: 'videos' });

    // Use gridfs-stream for backward compatibility if needed
    
    gfs = gridfsStream(db, mongoose.mongo);
    // gfs.collection('videos');

    console.log('GridFS initialized');

    // Create a TCP server for the worker
    const workerServer = net.createServer((socket) => {
        console.log(`Worker ${process.pid} handling a new connection`);

        socket.on('data', (data) => {
            console.log(`Worker ${process.pid} received: ${data.toString()}`);
            socket.write(`Echo from Worker ${process.pid}: ${data}`);
        });

        socket.on('end', () => {
            console.log(`Connection closed by client (Worker ${process.pid})`);
        });

        socket.on('error', (err) => {
            console.error(`Error in Worker ${process.pid}: ${err.message}`);
        });

        // Notify the primary process about the handled connection
        process.send(`Worker ${process.pid} handled a connection`);
    });

    // Workers listen independently
    workerServer.listen(6000, () => {
        console.log(`Worker ${process.pid} listening on port ${6000}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

//  connectDB(process.env.MONGO_URI);
// Receive messages from the primary process
// process.on('message', (msg) => {
//     console.log(`Worker ${process.pid} received from Primary: ${msg}`);
// });

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
