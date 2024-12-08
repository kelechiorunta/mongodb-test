import os from 'os';
import cluster from 'cluster';
import net from 'net';
import { createWriteStream } from 'fs'

const numCPUs = os.cpus().length;
const NET_SERVER_PORT = 4000; // Dedicated port for net server
const EXPRESS_SERVER_PORT = 3500; // Port for Express server (if any)

// Port for the TCP server
const PORT = 7000;

if (cluster.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Create a TCP server in the primary process (to get the handle)
    const server = net.createServer();
    server.listen(PORT, () => {
        console.log(`Primary process listening on port ${PORT}`);
    });

    // Get the low-level server handle
    const serverHandle = server._handle;

    // Pass the handle to each worker
    for (const id in cluster.workers) {
        cluster.workers[id].send({ type: 'serverHandle', serverHandle });
    }

    // Handle messages from workers
    for (const id in cluster.workers) {
        cluster.workers[id].on('message', (msg) => {
            console.log(`Message from Worker ${id}: ${msg}`);
        });
    }

} else if (cluster.isWorker) {
    console.log(`Worker ${process.pid} started`);

    // Listen for messages from the primary process
    process.on('message', (message) => {
        if (message.type === 'serverHandle' && message.serverHandle) {
            // Create a TCP server in the worker process
            const workerServer = net.createServer((socket) => {
                console.log(`Worker ${process.pid} handling connection`);

                // Handle socket data
                socket.on('data', (data) => {
                    console.log(`Worker ${process.pid} received: ${data}`);
                    socket.write(`Response from Worker ${process.pid}: Received "${data}"`);
                });

                socket.on('end', () => {
                    console.log(`Connection closed by client (Worker ${process.pid})`);
                });
            });

            // Listen on the server handle passed by the primary
            workerServer.listen(message.serverHandle, () => {
                console.log(`Worker ${process.pid} is listening for connections`);
            });
        }
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