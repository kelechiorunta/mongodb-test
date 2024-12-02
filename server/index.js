import path from 'path';
import http from 'http';
import process from 'process';
import { spawn, exec } from 'child_process'
import { open, readFile, createReadStream , createWriteStream } from 'fs'
import { pipeline, finished } from 'stream/promises'
import { Readable } from 'stream'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promisify } from 'util';
import { GridFSBucket } from 'mongodb'
import cors from 'cors';
import express from 'express'
import { writeFile } from 'fs/promises';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { connectDB, gridfsBucket } from './db.js';
import videosRoutes from './routes/videos.js';
import authRouter from './routes/auth.js';
import multer from 'multer';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { authenticateToken } from './middleware.js';

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
app.use(cors(corsSetup));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

app.enable('trust proxy');

app.use('/stream', videosRoutes);
app.use('/auth', authRouter);

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

app.post('/file', upload.single('file'), async(req, res) => {
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
        const readablestream = bufferstream(req.file.buffer)
        // Create an upload stream with GridFSBucket
        const writeablestream = gfsBucket.openUploadStream(req.file.originalname, {
            contentType: req.file.mimetype, // Set content type for the file
          });
        await piplelineAsync(readablestream, writeablestream);
        res.status(201).json({
            message: 'Upload successful',
            fileId: writeablestream.id,
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
const mongoURI = process.env.MONGO_URI

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