import os from 'os';
import cluster from 'cluster';
import net from 'net';
import { createWriteStream } from 'fs'
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

const numCPUs = os.cpus().length;
const PORT = 6000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (cluster.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);

    // Setup primary to run db.js for workers
    cluster.setupPrimary({
        exec: path.resolve(__dirname, 'index.js'),
    });

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork({
            ...process.env, // Ensure existing env vars are passed
            JWT_SECRET: process.env.JWT_SECRET || 'fallbacksecret', // Explicitly include JWT_SECRET
        });

        // Send initial message to the worker
        worker.send(`Worker ${worker.process.pid}, initialize your setup`);
    }

    // Listen for messages from workers
    for (const id in cluster.workers) {
        cluster.workers[id].on('message', (msg) => {
            console.log(`Message from Worker ${id}: ${msg}`);
        });
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} exited with code ${code} (signal: ${signal}). Restarting...`);
        cluster.fork();
    });
}


// if (cluster.isPrimary) {
//     console.log(`Primary process ${process.pid} is running`);

//     // // Create the net server on a separate port
//     const server = net.createServer((socket) => {
//         console.log("New connection received by Primary");

//     //     // Distribute the socket to a worker
//     //     const worker = cluster.workers[Object.keys(cluster.workers)[0]];
//     //     worker.send('socket', socket, {keepOpen:true});
//     // });

//     // Distribute the socket to a worker
//     const availableWorkers = Object.keys(cluster.workers);
//     if (availableWorkers.length > 0) {
//         const worker = cluster.workers[availableWorkers[0]];
//         worker.send('socket', socket);
//         console.log(`Socket sent to Worker ${worker.process.pid}`);
//     } else {
//         console.log("No available workers to handle the socket.");
//         socket.end("No workers available. Try again later.");
//     }
//     });

//     server.listen(NET_SERVER_PORT, () => {
//         console.log(`Net server listening on port ${NET_SERVER_PORT}`);

//         // Fork workers for each CPU
//         for (let i = 0; i < numCPUs; i++) {
//             cluster.fork();
//         }

//         cluster.on('message', (worker, msg) => {
//            console.log(worker.process.pid, "Message from process " + msg)
//            worker.send("Hello Process");
//         })

//         cluster.on('exit', (worker, code, signal) => {
//             console.log(`Worker ${worker.process.pid} exited`);
//             if (!worker.exitedAfterDisconnect) {
//                 console.log("Respawning worker...");
//                 // cluster.fork();
//             }
//         });
//     });
// } else if (cluster.isWorker) {
//     console.log(`Worker ${process.pid} started`);

//     process.on('message', (message, socket) => {
//         if (message === 'socket') {
//             console.log(`Worker ${process.pid} received a socket`);

//             // Reply to the primary process
//             process.send({ from: process.pid, status: "Socket received" });

//             // Write incoming socket data to a file
//             const writeStream = createWriteStream(`worker-${process.pid}.log`);
//             socket.pipe(writeStream);

//             // Respond to the socket
//             socket.write(`Hello from Worker ${process.pid}\n`);
//             socket.end();
//         }
//     });
// }

export default cluster