import path from 'path';
import http from 'http';
import process from 'process';
import { spawn, exec } from 'child_process'
import { open, readFile, createReadStream , createWriteStream } from 'fs'
import { pipeline, finished } from 'stream/promises'
import { Readable } from 'stream'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import errorHandler from 'errorhandler'
import { promisify } from 'util';
import { GridFSBucket, ObjectId } from 'mongodb'
import cors from 'cors';
import express from 'express'
import { writeFile } from 'fs/promises';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { connectDB, gridfsBucket } from './db.js';
import videosRoutes from './routes/videos.js';
import authRouter from './routes/auth.js';
import { createRequire } from 'module';// The createRequire is the API meant to load ES6 with the require loader.
const require = createRequire(import.meta.url) //resolve any file using the current folder of the file(index.js) which is server as the base path
const hello = require('./hello.js');// loads ES6 with the require loader. Alternatively, we can use await import('file'). This is the same as const hello = await import('./hello.js').
import multer from 'multer';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { authenticateToken } from './middleware.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken'
import sipRouter from './routes/command.js'

console.log(hello.default())
dotenv.config();

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const piplelineAsync = promisify(pipeline);

connectDB(process.env.MONGO_URI);

const allowedOrigins = ['https://node-test-bice.vercel.app', '*', 'http://localhost:3500', 'http://localhost:3001', 'http://localhost:3000' ]
let corsSetup = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin){
            return callback(null, true)
        }else{
            return callback("Not an allowed domain", false)
        }
    },
    credentials: true,
    method: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(express.static(path.resolve('build')));
// Serve static files (to access the images folder)
app.use('/images', express.static(path.join(import.meta.dirname, 'public/images')));
app.use(cors(corsSetup));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

app.enable('trust proxy');

// app.use('*', (req, res, next) => {
    
//     // if (req.user) {
//         jwt.verify(req.cookies.kelechi, process.env.JWT_SECRET, (err, decoded) => {
//             if (err) {
//                 return res.status(400).json({error: "Expired or Invalid Token"});
//             }
//             const token = decoded.user
//             req.user = token;
            
//             next();
//         })
//     // next();
//     //  }
    
// })

app.use('/auth', authRouter);
app.use('/stream', videosRoutes);
app.use('/sip', sipRouter);

const main = async() => {
    
    try{
        const { stdout, stderr } = await exec('/ls');
        // console.log(stdout, stderr)
    }
    catch(err){
        console.log(err?.message)
    }
}

main();

const run = async () => {
    try {
        // Create a readable stream for 'kus.txt'
        const rs = createReadStream('kus.txt', {
            encoding: 'utf-8',
            highWaterMark: 16 * 1024, // 16 KB chunks
        });

        // Create a writable stream for 'kusman.txt'
        const ws = createWriteStream('kusman.txt');

        // Use pipeline to read from 'kus.txt' and write to 'kusman.txt'
        await pipeline(rs, ws);

        console.log('Pipeline succeeded.');
    } catch (err) {
        console.error('Pipeline failed:', err.message);
    }
};

run();

app.get('*', (req, res) => {
    const indexFile = path.resolve('build', 'index.html');
    res.sendFile(indexFile);
})

app.get('/', (req, res) => {
    const indexFile = path.resolve('build', 'index.html');
    res.sendFile(indexFile);
})

app.get('/getApi', (req, res) => {
    try{
        readFile('kusman.txt', 'utf-8', (err, data) => {
            if (err) throw new Error(err);
            console.log(data)
            res.status(200).json({message:"Read successfully", streamedData: data})
            res.end();
        });
        
    }
    catch(err){
        console.error(err)
        res.status(500).json({error: "Server failed"})
    }
})

app.post('/saveApi', async(req, res) => {
    const { details } = req.body;
    // console.log(details)

    try{
        await writeFile(path.resolve('kusman.txt'), details, (err) => {
            if (err) throw new Error(err, "Unable to save");
            return res.status(200).json({message: "File written successfully"})
        })
    }
    catch(err) {
        return res.status(500).json({error: "Server Error. Unable to connect.", err});
    }
})

app.post('/file', upload.single('file'), authenticateToken, async(req, res) => {
    // const { file } = req.file;
    let gfsBucket;
    if (mongoose.connection.db){
        gfsBucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: 'file'
        });
    }

    const bufferstream = (buffer) => {
        const readable = new Readable();
            readable.push(buffer);
            readable.push(null);
            readable.on('end', () => {
                console.log("Stream finished successfully.")
            })
        return readable
    }

    try{

        const currentUser = await User.findOne({email: req.user?.email});
        if (!currentUser) {
            return res.status(400).json({error: "No active user!"})
        }

        const existingfile = await gfsBucket.find({_id: new ObjectId(currentUser.fileId)}).next();

    if (existingfile) {
        console.log(existingfile)
        // res.status(400).json({error: "File already exists"})
        await gfsBucket.delete(new ObjectId(currentUser.fileId))
    }
        const readablestream = bufferstream(req.file.buffer)
        // Create an upload stream with GridFSBucket
        const writeablestream = gfsBucket.openUploadStream(req.file.originalname, {
            contentType: req.file.mimetype, // Set content type for the file
          });
        await piplelineAsync(readablestream, writeablestream);

        currentUser.fileId = writeablestream.id;
        await currentUser.save();

        res.status(201).json({
            message: 'Upload successful',
            id: writeablestream.id,
          });
    }
    catch(err){
        console.error('Failed to stream', err);
        res.status(500).json({ error: 'Upload failed' });
    }
})



const server = http.createServer(app);

// server.on('request', async(req, res) => {
//     try{
//         await readFile('kusman.txt', 'utf-8', (err, data) => {
//             if (err) throw new Error(err);
//             console.log(data)
//             res.write(data)
//             res.end();
//         });
        
//     }
//     catch(err){
//         console.error(err)
//     }
// })

// Use the error handler middleware for development
if (process.env.NODE_ENV === 'development') {
    app.use(errorHandler({ log: true })); // Logs the errors to the console
}

// Production error handling
if (process.env.NODE_ENV === 'production') {
    // Use a basic custom error handler or log errors in production
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something went wrong!');
    });
}

const port = process.env.PORT || 3500

app.listen(port, () => {
    console.log("Hello Node")
})

//Process that responds to Ctrl+C exit (SIGINT). Exits the process
// process.on('SIGINT', () => {
//     console.log("Ctrl+C, Shuting down server");
//     app.close(() => {
//         process.exit(0);
//     })
    
// })



console.log(process.env.NODE_ENV)

// process.stdout.print("NODE_ENV=development --experimental-require-module --watch index.js")