import os from 'os';
import cluster from 'cluster';
import net from 'net';

const numCPUs = os.cpus().length;
const NET_SERVER_PORT = 8000; // Dedicated port for net server
const EXPRESS_SERVER_PORT = 3500; // Port for Express server (if any)

if (cluster.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);

    // Create the net server on a separate port
    const server = net.createServer((socket) => {
        console.log("New connection received by Primary");

        // Distribute the socket to a worker
        const worker = cluster.workers[Object.keys(cluster.workers)[0]];
        worker.send('socket', socket);
    });

    server.listen(NET_SERVER_PORT, () => {
        console.log(`Net server listening on port ${NET_SERVER_PORT}`);

        // Fork workers for each CPU
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} exited`);
            if (!worker.exitedAfterDisconnect) {
                console.log("Respawning worker...");
                cluster.fork();
            }
        });
    });
} else if (cluster.isWorker) {
    console.log(`Worker ${process.pid} started`);

    // Handle incoming messages (e.g., sockets) from the primary process
    process.on('message', (message, socket) => {
        if (message === 'socket') {
            socket.write(`Hello from Worker ${process.pid}\n`);
            socket.end();
        }
    });
}

export default cluster